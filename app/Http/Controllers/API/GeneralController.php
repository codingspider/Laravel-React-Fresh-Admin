<?php

namespace App\Http\Controllers\API;

use App\Models\Plan;
use App\Models\Currency;
use App\Models\Timezone;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Controllers\API\BaseController;
use Illuminate\Support\Facades\Log;

class GeneralController extends BaseController
{
    public function getCurrency(Request $request)
    {
        try {
            $currency = Currency::all();
            return $this->sendResponse($currency, 'Currency retrieved successfully.');
        } catch (\Exception $e) {
            \Log::error('Currency fetch failed: ' . $e->getMessage());
            return $this->sendError('Failed to retrieve currencies.', [], 500);
        }
    }
    
    public function getTimezone(Request $request)
    {
        try {
            $currency = Timezone::all();
            return $this->sendResponse($currency, 'Timezone retrieved successfully.');
        } catch (\Exception $e) {
            \Log::error('Timezone fetch failed: ' . $e->getMessage());
            return $this->sendError('Failed to retrieve timezones.', [], 500);
        }
    }
    
    public function getAllPlan(Request $request)
    {
        try {
            $plans = Plan::where('is_active',1)->get();
            return $this->sendResponse($plans, 'Plans retrieved successfully.');
        } catch (\Exception $e) {
            \Log::error('Plans fetch failed: ' . $e->getMessage());
            return $this->sendError('Failed to retrieve plans.', [], 500);
        }
    }
}
