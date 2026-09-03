<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\API\BaseController;
use App\Http\Controllers\Controller;
use App\Models\BusinessLocation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LocationController extends BaseController
{
    public function getAllLocations(Request $request)
    {
        try {
            $data = BusinessLocation::where('business_id', user_business_id())->get();
            return $this->sendResponse($data, 'Data retrieved successfully.');
        } catch (\Exception $e) {
            \Log::error('Location fetch failed: ' . $e->getMessage());
            return $this->sendError('Failed to retrieve locations.', [], 500);
        }
    }

}
