<?php

namespace Modules\Loyalty\Services;

use Modules\Loyalty\Models\Loyalty;
use Modules\Loyalty\Models\LoyaltyCustomerPoints;
use Modules\Loyalty\Models\LoyaltyPointsTransaction;
use Modules\Loyalty\Repositories\LoyaltyRepository;
use Modules\Customer\Models\Customer;
use Modules\POS\Models\Sale;

class LoyaltyService
{
    public function __construct(protected LoyaltyRepository $repository) {}

    public function settings(int $restaurantId): array
    {
        $programme = $this->repository->getOrCreateForRestaurant($restaurantId);

        $summary = [
            'customers_enrolled' => LoyaltyCustomerPoints::where('restaurant_id', $restaurantId)->count(),
            'points_in_circulation' => (int) LoyaltyCustomerPoints::where('restaurant_id', $restaurantId)->sum('points_balance'),
            'lifetime_points_earned' => (int) LoyaltyCustomerPoints::where('restaurant_id', $restaurantId)->sum('lifetime_points'),
            'lifetime_points_redeemed' => (int) LoyaltyCustomerPoints::where('restaurant_id', $restaurantId)->sum('total_redeemed'),
        ];

        return ['programme' => $programme, 'summary' => $summary];
    }

    public function updateSettings(int $restaurantId, array $data): Loyalty
    {
        $programme = $this->repository->getOrCreateForRestaurant($restaurantId);

        $programme->update($data);

        return $programme->fresh();
    }

    public function getProgramme(int $restaurantId): ?Loyalty
    {
        return $this->repository->activeForRestaurant($restaurantId);
    }

    public function customers(int $restaurantId, array $filters = [], int $perPage = 15)
    {
        return Customer::query()
            ->where('customers.restaurant_id', $restaurantId)
            ->leftJoin('loyalty_customer_points', function ($join) use ($restaurantId) {
                $join->on('loyalty_customer_points.customer_id', '=', 'customers.id')
                    ->where('loyalty_customer_points.restaurant_id', '=', $restaurantId);
            })
            ->leftJoin('branches', 'branches.id', '=', 'customers.branch_id')
            ->when($filters['branch_id'] ?? null, fn ($q, $b) => $q->where('customers.branch_id', $b))
            ->when($filters['search'] ?? null, function ($q, $search) {
                $q->where(function ($qq) use ($search) {
                    $qq->where('customers.name', 'like', "%{$search}%")
                        ->orWhere('customers.phone', 'like', "%{$search}%")
                        ->orWhere('customers.email', 'like', "%{$search}%");
                });
            })
            ->select([
                'customers.id',
                'customers.name',
                'customers.phone',
                'customers.email',
                'customers.address',
                'customers.city',
                'customers.branch_id',
                'branches.name as branch_name',
                'loyalty_customer_points.points_balance',
                'loyalty_customer_points.lifetime_points',
                'loyalty_customer_points.total_redeemed',
                'loyalty_customer_points.last_earned_at',
                'loyalty_customer_points.last_redeemed_at',
            ])
            ->orderByDesc('loyalty_customer_points.points_balance')
            ->paginate($perPage);
    }

    public function points(int $restaurantId, int $customerId): array
    {
        $programme = $this->repository->activeForRestaurant($restaurantId);
        $balance = $programme
            ? $this->getOrCreateCustomerPoints($restaurantId, $customerId, $programme->id)
            : null;

        $recentTransactions = $balance
            ? LoyaltyPointsTransaction::where('customer_id', $customerId)
                ->where('restaurant_id', $restaurantId)
                ->orderByDesc('created_at')
                ->limit(10)
                ->get()
            : collect();

        return [
            'customer' => Customer::where('restaurant_id', $restaurantId)->find($customerId),
            'programme' => $programme,
            'points_balance' => $balance?->points_balance ?? 0,
            'lifetime_points' => $balance?->lifetime_points ?? 0,
            'total_redeemed' => $balance?->total_redeemed ?? 0,
            'last_earned_at' => $balance?->last_earned_at,
            'last_redeemed_at' => $balance?->last_redeemed_at,
            'recent_transactions' => $recentTransactions,
        ];
    }

    public function transactions(int $restaurantId, array $filters = [], int $perPage = 15)
    {
        return LoyaltyPointsTransaction::query()
            ->with('customer:id,name,phone,branch_id')
            ->where('restaurant_id', $restaurantId)
            ->when($filters['customer_id'] ?? null, fn ($q, $id) => $q->where('customer_id', $id))
            ->when($filters['branch_id'] ?? null, fn ($q, $b) => $q->where('branch_id', $b))
            ->when($filters['type'] ?? null, fn ($q, $type) => $q->where('type', $type))
            ->when($filters['date_from'] ?? null, fn ($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($filters['date_to'] ?? null, fn ($q, $d) => $q->whereDate('created_at', '<=', $d))
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function adjustPoints(int $restaurantId, int $customerId, int $points, string $reason): LoyaltyCustomerPoints
    {
        if ($points === 0) {
            throw new \Exception(trans('loyalty::module.zero_points'));
        }

        $programme = $this->repository->getOrCreateForRestaurant($restaurantId);
        $balance = $this->getOrCreateCustomerPoints($restaurantId, $customerId, $programme->id);

        if ($points < 0 && $balance->points_balance < abs($points)) {
            throw new \Exception(trans('loyalty::module.points_insufficient'));
        }

        $this->applyTransaction($balance, 'adjust', $points, null, null, $reason);

        return $balance->fresh();
    }

    public function previewRedeem(int $restaurantId, int $customerId, float $orderTotal): array
    {
        $programme = $this->repository->activeForRestaurant($restaurantId);

        if (!$programme || !$programme->enable_redemption) {
            return [
                'enabled' => false,
                'points_balance' => 0,
                'max_redeem_points' => 0,
                'max_redeem_amount' => 0,
            ];
        }

        $balance = $this->getOrCreateCustomerPoints($restaurantId, $customerId, $programme->id);
        $available = (int) $balance->points_balance;
        $valuePerPoint = (float) $programme->currency_per_point;

        $maxValue = $available * $valuePerPoint;

        if ($programme->max_redeem_percent) {
            $maxValue = min($maxValue, $orderTotal * ((float) $programme->max_redeem_percent / 100));
        }
        if ($programme->min_order_amount && $orderTotal < (float) $programme->min_order_amount) {
            $maxValue = 0;
        }
        if ($programme->min_points_required && $available < (int) $programme->min_points_required) {
            $maxValue = 0;
        }

        $maxPoints = (int) floor($maxValue / $valuePerPoint);

        return [
            'enabled' => $maxPoints > 0,
            'points_balance' => $available,
            'min_points_required' => (int) ($programme->min_points_required ?? 0),
            'currency_per_point' => $programme->currency_per_point,
            'max_redeem_points' => $maxPoints,
            'max_redeem_amount' => round($maxPoints * $valuePerPoint, 2),
        ];
    }

    public function earnForSale(Sale $sale): void
    {
        $programme = $this->repository->activeForRestaurant($sale->restaurant_id);

        if (!$programme || !$programme->enable_earning) {
            return;
        }
        if (!$sale->customer_id || (float) $sale->total <= 0) {
            return;
        }
        if (LoyaltyPointsTransaction::where('sale_id', $sale->id)->where('type', 'earn')->exists()) {
            return;
        }

        $points = (int) $programme->points_per_order;
        if ($points <= 0) {
            return;
        }

        $balance = $this->getOrCreateCustomerPoints($sale->restaurant_id, $sale->customer_id, $programme->id);

        $this->applyTransaction(
            $balance,
            'earn',
            $points,
            $sale->id,
            null,
            trans('loyalty::module.earn_reason', ['invoice' => $sale->invoice_number])
        );
    }

    public function redeemForSale(Sale $sale, float $amount, ?string $reference = null): void
    {
        $programme = $this->repository->activeForRestaurant($sale->restaurant_id);

        if (!$programme || !$programme->enable_redemption) {
            throw new \Exception(trans('loyalty::module.redemption_disabled'));
        }
        if (!$sale->customer_id) {
            throw new \Exception(trans('loyalty::module.customer_required'));
        }
        if ($amount <= 0 || $amount > (float) $sale->total) {
            throw new \Exception(trans('loyalty::module.invalid_redeem_amount'));
        }

        $this->validateRedeem($programme, $sale, $amount);

        $pointsNeeded = (int) floor($amount / (float) $programme->currency_per_point);
        if ($pointsNeeded <= 0) {
            throw new \Exception(trans('loyalty::module.invalid_redeem_points'));
        }

        $balance = $this->getOrCreateCustomerPoints($sale->restaurant_id, $sale->customer_id, $programme->id);

        if ($programme->min_points_required && $balance->points_balance < (int) $programme->min_points_required) {
            throw new \Exception(trans('loyalty::module.min_points_not_met', ['points' => $programme->min_points_required]));
        }
        if ($balance->points_balance < $pointsNeeded) {
            throw new \Exception(trans('loyalty::module.points_insufficient'));
        }

        $this->applyTransaction(
            $balance,
            'redeem',
            -$pointsNeeded,
            $sale->id,
            $reference,
            trans('loyalty::module.redeem_reason', ['amount' => number_format($amount, 2), 'invoice' => $sale->invoice_number])
        );
    }

    public function restoreForRefund(Sale $sale, float $refundAmount): void
    {
        $programme = $this->repository->activeForRestaurant($sale->restaurant_id);

        if (!$programme || !$sale->customer_id || $refundAmount <= 0) {
            return;
        }

        $redeemed = LoyaltyPointsTransaction::where('sale_id', $sale->id)->where('type', 'redeem')->get();
        if ($redeemed->isEmpty()) {
            return;
        }

        $valuePerPoint = (float) $programme->currency_per_point;
        $pointsRedeemed = (int) $redeemed->sum(fn ($tx) => abs($tx->points));
        $pointsToRestore = min($pointsRedeemed, (int) floor($refundAmount / $valuePerPoint));

        if ($pointsToRestore <= 0) {
            return;
        }

        $balance = $this->getOrCreateCustomerPoints($sale->restaurant_id, $sale->customer_id, $programme->id);

        $this->applyTransaction(
            $balance,
            'restore',
            $pointsToRestore,
            $sale->id,
            null,
            trans('loyalty::module.restore_reason', ['invoice' => $sale->invoice_number])
        );
    }

    protected function validateRedeem(Loyalty $programme, Sale $sale, float $amount): void
    {
        if ($programme->min_order_amount && (float) $sale->total < (float) $programme->min_order_amount) {
            throw new \Exception(trans('loyalty::module.min_order_not_met', ['amount' => number_format((float) $programme->min_order_amount, 2)]));
        }

        if ($programme->max_redeem_percent) {
            $maxAmount = (float) $sale->total * ((float) $programme->max_redeem_percent / 100);
            if ($amount > $maxAmount) {
                throw new \Exception(trans('loyalty::module.max_redeem_exceeded', ['amount' => number_format($maxAmount, 2)]));
            }
        }
    }

    protected function getOrCreateCustomerPoints(int $restaurantId, int $customerId, ?int $loyaltyId): LoyaltyCustomerPoints
    {
        return LoyaltyCustomerPoints::firstOrCreate(
            ['restaurant_id' => $restaurantId, 'customer_id' => $customerId],
            ['loyalty_id' => $loyaltyId]
        );
    }

    protected function applyTransaction(
        LoyaltyCustomerPoints $balance,
        string $type,
        int $delta,
        ?int $saleId,
        ?string $reference,
        ?string $reason
    ): LoyaltyPointsTransaction {
        $newBalance = max(0, $balance->points_balance + $delta);

        $transaction = LoyaltyPointsTransaction::create([
            'restaurant_id' => $balance->restaurant_id,
            'customer_id' => $balance->customer_id,
            'loyalty_id' => $balance->loyalty_id,
            'type' => $type,
            'points' => $delta,
            'balance_after' => $newBalance,
            'sale_id' => $saleId,
            'reference' => $reference,
            'reason' => $reason,
            'created_by' => auth()->id(),
        ]);

        $balance->points_balance = $newBalance;

        if ($type === 'earn') {
            $balance->lifetime_points += $delta;
            $balance->last_earned_at = now();
        } elseif ($type === 'redeem') {
            $balance->total_redeemed += abs($delta);
            $balance->last_redeemed_at = now();
        }

        $balance->save();

        return $transaction;
    }
}
