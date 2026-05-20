<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\API\BaseController;
use App\Http\Controllers\Controller;
use App\Models\BusinessLocation;
use Illuminate\Http\Request;

class LocationController extends BaseController
{
    public function getAllLocations(Request $request)
    {
        try {
            $data = BusinessLocation::where('business_id', user_business_id())->get();
            return $this->sendResponse($data, 'Data retrieved successfully.');
        } catch (\Exception $e) {
            return $this->sendError('Server Error: '.$e->getMessage());
        }
    }

}
