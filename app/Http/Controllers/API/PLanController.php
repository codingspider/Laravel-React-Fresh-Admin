<?php

namespace App\Http\Controllers\API;

use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\API\BaseController;


/**
 * @group Plan management
 *
 * APIs for managing Plans
 * 
 */
class PLanController extends BaseController
{
    /**
     * Display a listing of the plans.
     *
     * GET /plans
     */

    public function index(Request $request)
    {
        try {
            $plans = Plan::paginate(10);
            return $this->sendResponse($plans, 'Plans retrieved successfully.');

        } catch (\Exception $e) {
            \Log::error('Plans fetch failed: ' . $e->getMessage());
            return $this->sendError('Failed to retrieve plans.', [], 500);
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
     * POST /plans
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required',
            'price' => 'required',
            'billing_cycle' => 'required',
            'branch_limit' => 'required',
            'user_limit' => 'required',
            'invoice_limit' => 'required',
        ]);

        DB::beginTransaction();
        try {
            $plan = Plan::create($validated);
            DB::commit();
            return $this->sendResponse(['plan' => $plan], 'Plan saved successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Plan creation failed: ' . $e->getMessage());
            return $this->sendError('Failed to create plan.', [], 500);
        }
    }

    /**
     * Display the specified plan.
     *
     * GET /plans/{id}
     */
    public function edit($id)
    {
        try {
            $plan = Plan::find($id);
            return $this->sendResponse($plan, 'Plan retrieved successfully.');

        } catch (\Exception $e) {
            \Log::error('Plan fetch failed: ' . $e->getMessage());
            return $this->sendError('Failed to retrieve plan.', [], 500);
        }
    }

     /**
     * Update the specified plan in storage.
     *
     * PUT /plans/{id}
     */
    public function update(Request $request, Plan $plan)
    {
        $validated = $request->validate([
            'name' => 'required',
            'price' => 'required',
            'billing_cycle' => 'required',
            'branch_limit' => 'required',
            'user_limit' => 'required',
            'invoice_limit' => 'required',
        ]);

        DB::beginTransaction();
        try {
            $plan->update($validated);

            DB::commit();
            return $this->sendResponse($plan, 'Plan updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Plan update failed: ' . $e->getMessage());
            return $this->sendError('Failed to update plan.', [], 500);
        }
    }


    /**
     * Remove the specified plan from storage.
     *
     * DELETE /plans/{id}
     */
    public function destroy($id)
    {
        try {
            $plan = Plan::find($id);
            if (!$plan) {
                return $this->sendError('Plan not found.', 404);
            }
            $plan->delete();
            return $this->sendResponse([], 'Plan deleted successfully.');
        } catch (\Exception $e) {
            \Log::error('Plan deletion failed: ' . $e->getMessage());
            return $this->sendError('Failed to delete plan.', [], 500);
        }
    }
}
