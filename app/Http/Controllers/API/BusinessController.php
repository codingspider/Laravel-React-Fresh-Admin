<?php

namespace App\Http\Controllers\API;

use App\Models\Plan;
use App\Models\Payment;
use App\Models\Business;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Services\BusinessCreationService;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\Http\Requests\StoreBusinessRequest;
use App\Http\Controllers\API\BaseController;

class BusinessController extends BaseController
{
    /**
     * Display a listing of the business.
     *
     * GET /business
     */

    public function index(Request $request)
    {
        try {
            $business = Business::paginate(10);
            return $this->sendResponse($business, 'Business retrived successfully.');        } catch (\Exception $e) {
            \Log::error('Business fetch failed: ' . $e->getMessage());
            return $this->sendError('Failed to retrieve businesses.', [], 500);
        }
    }
    
    public function getAllPlans(Request $request)
    {
        try {
            $plans = Plan::whereIsActive(1)->get();
            return $this->sendResponse($plans, 'Plans retrieved successfully.');

        } catch (\Exception $e) {
            \Log::error('Plans fetch failed: ' . $e->getMessage());
            return $this->sendError('Failed to retrieve plans.', [], 500);
        }
    }

     /**
     * Store a newly created plan in storage.
     *
     * POST /business
     */
    public function store(StoreBusinessRequest $request, BusinessCreationService $service)
    {
        DB::beginTransaction();
        try {
            $result = $service->create($request->validated());
            DB::commit();
            return $this->sendResponse($result, 'Business created successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Business creation failed: ' . $e->getMessage());
            return $this->sendError('Failed to create business.', [], 500);
        }
    }

    /**
     * Display the specified business.
     *
     * GET /business/{id}
     */
    public function edit($id)
    {
        try {
            $plan = Business::find($id);
            return $this->sendResponse($plan, 'Business retrieved successfully.');
        } catch (\Exception $e) {
            \Log::error('Business fetch failed: ' . $e->getMessage());
            return $this->sendError('Failed to retrieve business.', [], 500);
        }
    }

     /**
     * Update the specified business in storage.
     *
     * PUT /business/{id}
     */
    public function update(Request $request, Business $business)
    {
        $request->validate([
            'name' => 'required',
            'price' => 'required',
            'billing_cycle' => 'required',
            'branch_limit' => 'required',
            'user_limit' => 'required',
            'invoice_limit' => 'required',
        ]);

        DB::beginTransaction();
        try {
            $business->update($request->only([
                'name', 'is_active', 'price', 'billing_cycle',
                'branch_limit', 'user_limit', 'invoice_limit',
            ]));

            DB::commit();
            return $this->sendResponse($business, 'Business updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Business update failed: ' . $e->getMessage());
            return $this->sendError('Failed to update business.', [], 500);
        }
    }


    /**
     * Remove the specified business from storage.
     *
     * DELETE /business/{id}
     */
    public function destroy($id)
    {
        try {
            $business = Business::find($id);
            if (!$business) {
                return $this->sendError('Business not found.', [], 404);
            }
            $business->delete();
            return $this->sendResponse([], 'Business deleted successfully.');
        } catch (\Exception $e) {
            \Log::error('Business deletion failed: ' . $e->getMessage());
            return $this->sendError('Failed to delete business.', [], 500);
        }
    }
}
