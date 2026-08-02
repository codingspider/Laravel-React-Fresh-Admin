<?php

namespace App\Services;

use App\Models\Supplier;
use App\Models\SupplierContact;
use App\Models\SupplierDocument;
use App\Models\SupplierRating;
use App\Models\SupplierTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SupplierService
{
    /**
     * Create a supplier and its primary contact.
     */
    public function create(array $data): Supplier
    {
        return DB::transaction(function () use ($data) {
            $restaurantId = $data['restaurant_id'] ?? getRestaurantId();
            $data['restaurant_id'] = $restaurantId;
            $data['code'] = $data['code'] ?? 'SUP-' . strtoupper(Str::random(6));
            $data['is_active'] = $data['is_active'] ?? true;

            $contacts = $data['contacts'] ?? [];
            unset($data['contacts']);

            $supplier = Supplier::create($data);

            if ($contacts) {
                $this->syncContacts($supplier, $contacts);
            } elseif (!empty($data['contact_person']) || !empty($data['phone']) || !empty($data['email'])) {
                SupplierContact::create([
                    'supplier_id' => $supplier->id,
                    'name' => $data['contact_person'] ?? $data['name'],
                    'email' => $data['email'] ?? null,
                    'phone' => $data['phone'] ?? null,
                    'is_primary' => true,
                ]);
            }

            return $supplier->fresh(['contacts']);
        });
    }

    public function update(int $id, array $data): Supplier
    {
        return DB::transaction(function () use ($id, $data) {
            $supplier = Supplier::findOrFail($id);

            $contacts = $data['contacts'] ?? null;
            unset($data['contacts']);

            $supplier->update($data);

            if ($contacts !== null) {
                $this->syncContacts($supplier, $contacts);
            }

            return $supplier->fresh(['contacts', 'documents']);
        });
    }

    protected function syncContacts(Supplier $supplier, array $contacts): void
    {
        $supplier->contacts()->delete();
        foreach ($contacts as $contact) {
            if (empty($contact['name'])) {
                continue;
            }
            SupplierContact::create([
                'supplier_id' => $supplier->id,
                'name' => $contact['name'],
                'designation' => $contact['designation'] ?? null,
                'email' => $contact['email'] ?? null,
                'phone' => $contact['phone'] ?? null,
                'is_primary' => (bool) ($contact['is_primary'] ?? false),
                'notes' => $contact['notes'] ?? null,
            ]);
        }
    }

    /**
     * Upload and attach a document to a supplier.
     */
    public function addDocument(Supplier $supplier, array $data, $file): SupplierDocument
    {
        $path = uploadImage($file, 'uploads/suppliers/documents');
        if (!$path && $file) {
            $folder = 'uploads/suppliers/documents';
            $uploadPath = public_path($folder);
            if (!file_exists($uploadPath)) {
                mkdir($uploadPath, 0777, true);
            }
            $filename = uniqid() . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move($uploadPath, $filename);
            $path = $folder . '/' . $filename;
        }

        return SupplierDocument::create([
            'supplier_id' => $supplier->id,
            'title' => $data['title'],
            'document_type' => $data['document_type'] ?? 'other',
            'file_path' => $path,
            'file_name' => $data['file_name'] ?? $file?->getClientOriginalName() ?? basename((string) $path),
            'file_type' => $file?->getClientOriginalExtension() ?? null,
            'file_size' => $file?->getSize() ?? null,
            'issue_date' => $data['issue_date'] ?? null,
            'expiry_date' => $data['expiry_date'] ?? null,
            'notes' => $data['notes'] ?? null,
            'uploaded_by' => auth()->id() ?? 1,
        ]);
    }

    public function addRating(Supplier $supplier, array $data): SupplierRating
    {
        $values = [
            $data['quality_rating'] ?? null,
            $data['delivery_rating'] ?? null,
            $data['price_rating'] ?? null,
        ];
        $values = array_filter($values, fn($v) => $v !== null && $v !== '');
        $overall = count($values) ? round(array_sum($values) / count($values)) : null;

        return SupplierRating::updateOrCreate(
            ['supplier_id' => $supplier->id, 'user_id' => auth()->id() ?? 1],
            [
                'quality_rating' => $data['quality_rating'] ?? null,
                'delivery_rating' => $data['delivery_rating'] ?? null,
                'price_rating' => $data['price_rating'] ?? null,
                'overall_rating' => $overall,
                'comment' => $data['comment'] ?? null,
            ]
        );
    }

    /**
     * Full CRM overview for a supplier.
     */
    public function overview(int $supplierId): array
    {
        $supplier = Supplier::with(['contacts', 'documents', 'ratings.user'])->findOrFail($supplierId);

        $purchases = $supplier->purchases()->withCount('items')->get();
        $totalPurchases = (float) $purchases->sum('total');
        $totalPaid = (float) $supplier->payments()->where('status', '!=', 'failed')->sum('amount');
        $totalReturns = (float) $supplier->returns?->sum('total') ?? 0;

        $transactions = SupplierTransaction::where('supplier_id', $supplierId)
            ->orderByDesc('transaction_date')
            ->orderByDesc('id')
            ->limit(50)
            ->get();

        return [
            'supplier' => $supplier,
            'total_purchases' => round($totalPurchases, 2),
            'total_paid' => round($totalPaid, 2),
            'total_returns' => round($totalReturns, 2),
            'outstanding_balance' => round($totalPurchases - $totalPaid + (float) $supplier->opening_balance, 2),
            'purchase_count' => $purchases->count(),
            'transactions' => $transactions,
        ];
    }

    public function delete(int $id): void
    {
        Supplier::findOrFail($id)->delete();
    }
}
