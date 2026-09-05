<?php

namespace Modules\Subscription\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Modules\SuperAdmin\Services\StripeSettingService;
use Modules\Subscription\Models\Subscription;
use Modules\Plan\Models\Plan;
use Stripe\Stripe;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;

class StripeController extends Controller
{
    public function __construct(
        protected StripeSettingService $stripeService
    ) {}

    /**
     * Get Stripe publishable key for the frontend (any authenticated user).
     */
    public function config(): JsonResponse
    {
        $settings = $this->stripeService->all();

        if (empty($settings['enabled']) || $settings['enabled'] !== '1') {
            return response()->json([
                'status' => 'success',
                'data' => ['enabled' => false],
            ]);
        }

        $key = $settings['test_mode'] === '1'
            ? $settings['test_publishable_key']
            : $settings['live_publishable_key'];

        return response()->json([
            'status' => 'success',
            'data' => [
                'enabled' => true,
                'publishable_key' => $key,
                'test_mode' => $settings['test_mode'] === '1',
            ],
        ]);
    }

    /**
     * Get the current user's own subscription (no view_subscriptions permission needed).
     */
    public function mySubscription(): JsonResponse
    {
        $restaurantId = getRestaurantId();

        if (!$restaurantId) {
            return response()->json([
                'status' => 'success',
                'data' => null,
            ]);
        }

        $subscription = Subscription::where('restaurant_id', $restaurantId)
            ->with('plan')
            ->latest()
            ->first();

        Log::info('mySubscription fetched', [
            'restaurant_id' => $restaurantId,
            'subscription_id' => $subscription?->id,
            'status' => $subscription?->status,
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $subscription,
        ]);
    }

    /**
     * Create a Stripe Checkout session for subscription renewal.
     */
    public function createCheckoutSession(Request $request): JsonResponse
    {
        $restaurantId = getRestaurantId();

        if (!$restaurantId) {
            return response()->json([
                'status' => 'error',
                'message' => 'No restaurant associated with your account.',
            ], 404);
        }

        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'success_url' => 'nullable|string|max:500',
            'cancel_url' => 'nullable|string|max:500',
        ]);

        $settings = $this->stripeService->all();
        $secretKey = $settings['test_mode'] === '1'
            ? $settings['test_secret_key']
            : $settings['live_secret_key'];

        if (empty($settings['enabled']) || $settings['enabled'] !== '1' || !$secretKey) {
            Log::warning('Stripe checkout attempted but Stripe not configured');
            return response()->json([
                'status' => 'error',
                'message' => 'Stripe payments are not configured. Please contact support.',
            ], 422);
        }

        $plan = Plan::findOrFail($validated['plan_id']);

        if (!$plan->is_active || $plan->status !== 'active') {
            return response()->json([
                'status' => 'error',
                'message' => 'This plan is not available.',
            ], 422);
        }

        Stripe::setApiKey($secretKey);

        $restaurant = \Modules\Restaurant\Models\Restaurant::find($restaurantId);

        try {
            Log::info('Creating Stripe Checkout session', [
                'restaurant_id' => $restaurantId,
                'plan_id' => $plan->id,
                'plan_name' => $plan->name,
                'amount' => $plan->price,
            ]);

            $session = \Stripe\Checkout\Session::create([
                'mode' => 'payment',
                'line_items' => [
                    [
                        'price_data' => [
                            'currency' => strtolower($restaurant?->currency_code ?? 'usd'),
                            'product_data' => [
                                'name' => "Subscription Renewal - {$plan->name}",
                                'description' => "Renew your {$plan->name} subscription ({$plan->billing_cycle})",
                                'tax_code' => 'txcd_10103001',
                            ],
                            'unit_amount' => (int) ($plan->price * 100),
                        ],
                        'quantity' => 1,
                    ],
                ],
                'metadata' => [
                    'restaurant_id' => $restaurantId,
                    'plan_id' => $plan->id,
                    'plan_name' => $plan->name,
                    'billing_cycle' => $plan->billing_cycle,
                ],
                'success_url' => $validated['success_url']
                    ?? url('/subscription/renew?payment=success&session_id={CHECKOUT_SESSION_ID}'),
                'cancel_url' => $validated['cancel_url']
                    ?? url('/subscription/renew?payment=cancelled'),
                'customer_email' => $request->user()->email,
            ]);

            Log::info('Stripe Checkout session created', [
                'session_id' => $session->id,
                'restaurant_id' => $restaurantId,
            ]);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'session_id' => $session->id,
                    'url' => $session->url,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Stripe checkout session creation failed', [
                'restaurant_id' => $restaurantId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create payment session. Please try again.',
            ], 500);
        }
    }

    /**
     * Confirm a payment by verifying the Stripe session and creating the subscription.
     * Called by the frontend after redirecting back from Stripe Checkout.
     */
    public function confirmPayment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => 'required|string',
        ]);

        $restaurantId = getRestaurantId();

        Log::info('Stripe confirmPayment called', [
            'restaurant_id' => $restaurantId,
            'session_id' => $validated['session_id'],
        ]);

        if (!$restaurantId) {
            return response()->json([
                'status' => 'error',
                'message' => 'No restaurant associated with your account.',
            ], 404);
        }

        $settings = $this->stripeService->all();
        $secretKey = $settings['test_mode'] === '1'
            ? $settings['test_secret_key']
            : $settings['live_secret_key'];

        if (!$secretKey) {
            Log::error('confirmPayment: Stripe secret key not configured');
            return response()->json([
                'status' => 'error',
                'message' => 'Payment gateway not configured.',
            ], 422);
        }

        Stripe::setApiKey($secretKey);

        try {
            $session = \Stripe\Checkout\Session::retrieve($validated['session_id']);

            Log::info('Stripe session retrieved', [
                'session_id' => $session->id,
                'payment_status' => $session->payment_status,
                'status' => $session->status,
            ]);

            if ($session->payment_status !== 'paid') {
                Log::warning('confirmPayment: Session not paid', [
                    'session_id' => $session->id,
                    'payment_status' => $session->payment_status,
                ]);
                return response()->json([
                    'status' => 'error',
                    'message' => 'Payment has not been completed.',
                ], 422);
            }

            $metadata = $session->metadata ?? [];
            $metadataRestaurantId = (int) ($metadata->restaurant_id ?? 0);
            $planId = (int) ($metadata->plan_id ?? 0);

            // Verify the session belongs to this restaurant
            if ($metadataRestaurantId !== (int) $restaurantId) {
                Log::warning('confirmPayment: Restaurant mismatch', [
                    'session_restaurant_id' => $metadataRestaurantId,
                    'auth_restaurant_id' => $restaurantId,
                ]);
                return response()->json([
                    'status' => 'error',
                    'message' => 'Payment does not belong to your account.',
                ], 403);
            }

            // Check if subscription was already created (by webhook)
            $existingSub = Subscription::where('restaurant_id', $restaurantId)
                ->where('payment_reference', $session->payment_intent)
                ->first();

            if ($existingSub) {
                Log::info('confirmPayment: Subscription already exists from webhook', [
                    'subscription_id' => $existingSub->id,
                ]);
                $existingSub->load(['restaurant', 'plan']);
                return response()->json([
                    'status' => 'success',
                    'message' => 'Subscription renewed successfully.',
                    'data' => $existingSub,
                ]);
            }

            // Create the subscription
            $this->createOrUpdateSubscription(
                $restaurantId,
                $planId,
                true,
                $session->payment_intent,
                ($session->amount_total ?? 0) / 100,
                (array) $metadata
            );

            $newSub = Subscription::where('restaurant_id', $restaurantId)
                ->where('payment_reference', $session->payment_intent)
                ->first();

            if ($newSub) {
                $newSub->load(['restaurant', 'plan']);
            }

            Log::info('confirmPayment: Subscription created successfully', [
                'restaurant_id' => $restaurantId,
                'plan_id' => $planId,
                'subscription_id' => $newSub?->id,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Subscription renewed successfully.',
                'data' => $newSub,
            ]);
        } catch (\Exception $e) {
            Log::error('confirmPayment failed', [
                'restaurant_id' => $restaurantId,
                'session_id' => $validated['session_id'],
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to verify payment. Please contact support.',
            ], 500);
        }
    }

    /**
     * Create a PaymentIntent (for embedded payment form).
     */
    public function createPaymentIntent(Request $request): JsonResponse
    {
        $restaurantId = getRestaurantId();

        if (!$restaurantId) {
            return response()->json([
                'status' => 'error',
                'message' => 'No restaurant associated with your account.',
            ], 404);
        }

        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
        ]);

        $settings = $this->stripeService->all();
        $secretKey = $settings['test_mode'] === '1'
            ? $settings['test_secret_key']
            : $settings['live_secret_key'];

        if (empty($settings['enabled']) || $settings['enabled'] !== '1' || !$secretKey) {
            return response()->json([
                'status' => 'error',
                'message' => 'Stripe payments are not configured.',
            ], 422);
        }

        $plan = Plan::findOrFail($validated['plan_id']);

        if (!$plan->is_active || $plan->status !== 'active') {
            return response()->json([
                'status' => 'error',
                'message' => 'This plan is not available.',
            ], 422);
        }

        Stripe::setApiKey($secretKey);

        $restaurant = \Modules\Restaurant\Models\Restaurant::find($restaurantId);

        try {
            $intent = \Stripe\PaymentIntent::create([
                'amount' => (int) ($plan->price * 100),
                'currency' => strtolower($restaurant?->currency_code ?? 'usd'),
                'automatic_payment_methods' => ['enabled' => true],
                'metadata' => [
                    'restaurant_id' => $restaurantId,
                    'plan_id' => $plan->id,
                    'plan_name' => $plan->name,
                    'billing_cycle' => $plan->billing_cycle,
                ],
                'description' => "Subscription Renewal - {$plan->name}",
                'receipt_email' => $request->user()->email,
            ]);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'client_secret' => $intent->client_secret,
                    'payment_intent_id' => $intent->id,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Stripe PaymentIntent creation failed', [
                'restaurant_id' => $restaurantId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to initialize payment. Please try again.',
            ], 500);
        }
    }

    /**
     * Stripe webhook handler.
     */
    public function webhook(Request $request): JsonResponse
    {
        $settings = $this->stripeService->all();
        $webhookSecret = $settings['webhook_secret'] ?? null;

        if (!$webhookSecret) {
            Log::warning('Stripe webhook received but webhook_secret not configured');
            return response()->json(['error' => 'Webhook not configured'], 400);
        }

        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
        } catch (SignatureVerificationException $e) {
            Log::warning('Stripe webhook signature verification failed');
            return response()->json(['error' => 'Invalid signature'], 400);
        } catch (\Exception $e) {
            Log::error('Stripe webhook error', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Webhook error'], 400);
        }

        Log::info('Stripe webhook received', ['type' => $event->type, 'id' => $event->id]);

        match ($event->type) {
            'checkout.session.completed' => $this->handleCheckoutCompleted($event->data->object),
            'payment_intent.succeeded' => $this->handlePaymentSucceeded($event->data->object),
            'payment_intent.payment_failed' => $this->handlePaymentFailed($event->data->object),
            default => Log::info('Unhandled Stripe event type: ' . $event->type),
        };

        return response()->json(['status' => 'success']);
    }

    protected function handleCheckoutCompleted($session): void
    {
        $metadata = $session->metadata ?? [];
        $restaurantId = $metadata->restaurant_id;
        $planId = $metadata->plan_id;

        Log::info('Webhook: checkout.session.completed', [
            'session_id' => $session->id,
            'restaurant_id' => $restaurantId,
            'plan_id' => $planId,
        ]);

        if (!$restaurantId || !$planId) {
            Log::warning('Checkout session missing metadata', ['session_id' => $session->id]);
            return;
        }

        // Check if already confirmed by confirmPayment endpoint
        $existing = Subscription::where('restaurant_id', (int) $restaurantId)
            ->where('payment_reference', $session->payment_intent)
            ->first();

        if ($existing) {
            Log::info('Webhook: Subscription already created, skipping', ['subscription_id' => $existing->id]);
            return;
        }

        $this->createOrUpdateSubscription(
            (int) $restaurantId,
            (int) $planId,
            $session->payment_status === 'paid',
            $session->payment_intent,
            ($session->amount_total ?? 0) / 100,
            (array) $metadata
        );
    }

    protected function handlePaymentSucceeded($paymentIntent): void
    {
        $metadata = $paymentIntent->metadata ?? [];
        $restaurantId = $metadata->restaurant_id;
        $planId = $metadata->plan_id;

        Log::info('Webhook: payment_intent.succeeded', [
            'payment_intent' => $paymentIntent->id,
            'restaurant_id' => $restaurantId,
            'plan_id' => $planId,
        ]);

        if (!$restaurantId || !$planId) {
            return;
        }

        // Check if already created
        $existing = Subscription::where('restaurant_id', (int) $restaurantId)
            ->where('payment_reference', $paymentIntent->id)
            ->first();

        if ($existing) {
            Log::info('Webhook: Subscription already exists, skipping', ['subscription_id' => $existing->id]);
            return;
        }

        $this->createOrUpdateSubscription(
            (int) $restaurantId,
            (int) $planId,
            true,
            $paymentIntent->id,
            $paymentIntent->amount / 100,
            (array) $metadata
        );
    }

    protected function handlePaymentFailed($paymentIntent): void
    {
        $metadata = $paymentIntent->metadata ?? [];
        $restaurantId = $metadata['restaurant_id'] ?? null;

        if (!$restaurantId) return;

        Log::warning('Webhook: payment_intent.payment_failed', [
            'payment_intent' => $paymentIntent->id,
            'restaurant_id' => $restaurantId,
            'error' => $paymentIntent->last_payment_error->message ?? 'Unknown',
        ]);

        $subscription = Subscription::where('restaurant_id', $restaurantId)
            ->where('status', 'active')
            ->latest()
            ->first();

        if ($subscription) {
            $subscription->update([
                'payment_status' => 'failed',
                'metadata' => array_merge($subscription->metadata ?? [], [
                    'last_payment_error' => $paymentIntent->last_payment_error->message ?? 'Payment failed',
                ]),
            ]);
        }
    }

    protected function createOrUpdateSubscription(
        int $restaurantId,
        int $planId,
        bool $paid,
        ?string $paymentReference,
        float $amount,
        array $metadata
    ): void {
        $plan = Plan::find($planId);

        if (!$plan) {
            Log::warning('Plan not found for subscription creation', ['plan_id' => $planId]);
            return;
        }

        $startDate = now();
        $endDate = match ($plan->billing_cycle) {
            'monthly' => $startDate->copy()->addMonth(),
            'quarterly' => $startDate->copy()->addMonths(3),
            'yearly' => $startDate->copy()->addYear(),
            default => $startDate->copy()->addMonth(),
        };

        // Expire any existing active subscription
        Subscription::where('restaurant_id', $restaurantId)
            ->where('status', 'active')
            ->update(['status' => 'expired']);

        // Create new subscription
        $subscription = Subscription::create([
            'restaurant_id' => $restaurantId,
            'plan_id' => $planId,
            'starts_at' => $startDate,
            'ends_at' => $endDate,
            'is_trial' => false,
            'payment_status' => $paid ? 'paid' : 'pending',
            'payment_method' => 'online',
            'payment_amount' => $amount,
            'payment_date' => now(),
            'payment_reference' => $paymentReference,
            'status' => 'active',
            'metadata' => array_merge($metadata, [
                'payment_gateway' => 'stripe',
            ]),
        ]);

        Log::info('Subscription renewed via Stripe', [
            'subscription_id' => $subscription->id,
            'restaurant_id' => $restaurantId,
            'plan_id' => $planId,
            'plan_name' => $plan->name,
            'amount' => $amount,
            'ends_at' => $endDate->toDateTimeString(),
        ]);
    }
}
