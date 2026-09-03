<?php

namespace App\Http\Controllers\API\Admin;

use App\Models\Addon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\AddonRequest;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\API\BaseController;

class AddonController extends BaseController
{
    public function index(Request $request)
    {
        try {
            $addons = Addon::with('branch')->whereIn('branch_id', getBranchIds())->paginate(10);
            return $this->sendResponse($addons, 'Addons retrieved successfully.');
        } catch (\Exception $e) {
            \Log::error('Addon fetch failed: ' . $e->getMessage());
            return $this->sendError('Failed to retrieve addons.', [], 500);
        }
    }
    
    public function getAllAddons(Request $request)
    {
        try {
            $addons = Addon::whereIn('branch_id', getBranchIds())->get();
            return $this->sendResponse($addons, 'Addons retrieved successfully.');
        } catch (\Exception $e) {
            \Log::error('Addon fetch failed: ' . $e->getMessage());
            return $this->sendError('Failed to retrieve addons.', [], 500);
        }
    }

    /**
     * Show single product (ingredient)
     */
    public function show(Addon $addon)
    {
        return $this->sendResponse($addon, 'Addon retrieved successfully.');
    }

    /**
     * Edit product (same as show)
     */
    public function edit($id)
    {
        $category = Addon::find($id);
        return $this->sendResponse($category, 'Addon retrieved successfully.');
    }

    /**
     * Store new product (ingredient)
     */
    public function store(AddonRequest $request)
    {

        DB::beginTransaction();
        try {
            $addon = new Addon();
            $addon->name = $request->name;
            $addon->price = $request->price;
            $addon->branch_id = $request->branch_id;
            $addon->is_active = $request->is_active;
            $addon->created_by = createdBy();
            $addon->save();
            activityLog('addon','created','User '.auth()->user()->name.' created addon '.$addon->name);
            DB::commit();
            return $this->sendResponse($addon, 'Addon saved successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Addon creation failed: ' . $e->getMessage());
            return $this->sendError('Failed to create addon.', [], 500);
        }
    }

    /**
     * Update product
     */
    public function update(AddonRequest $request, Addon $addon)
    {

        DB::beginTransaction();
        try {
            $addon->name = $request->name;
            $addon->price = $request->price;
            $addon->branch_id = $request->branch_id;
            $addon->is_active = $request->is_active;
            $addon->save();
            activityLog('addon','updated','User '.auth()->user()->name.' updated addon '.$addon->name);
            DB::commit();
            return $this->sendResponse($addon, 'Addon updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Addon update failed: ' . $e->getMessage());
            return $this->sendError('Failed to update addon.', [], 500);
        }
    }

    /**
     * Delete product
     */
    public function destroy($id)
    {
        try {
            $addon = Addon::find($id);
            $addon->delete();
            activityLog('addon','deleted','User '.auth()->user()->name.' deleted addon '.$addon->name);
            return $this->sendResponse([], 'Data deleted successfully.');
        } catch (\Exception $e) {
            \Log::error('Addon deletion failed: ' . $e->getMessage());
            return $this->sendError('Failed to delete addon.', [], 500);
        }
    }
}
