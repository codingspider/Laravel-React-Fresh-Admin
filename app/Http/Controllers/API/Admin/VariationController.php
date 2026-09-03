<?php

namespace App\Http\Controllers\API\Admin;

use App\Models\Variation;
use Illuminate\Http\Request;
use App\Models\VariationItem;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\API\BaseController;

class VariationController extends BaseController
{
    public function index(Request $request)
    {
        try {
            $variation = Variation::with('variation_items', 'branch')->whereIn('branch_id', getBranchIds())->latest()->paginate(10);
            return $this->sendResponse($variation, 'Data retrieved successfully.');
        } catch (\Exception $e) {
            \Log::error('Variation fetch failed: ' . $e->getMessage());
            return $this->sendError('Failed to retrieve variations.', [], 500);
        }
    }
    
    public function getAllVariations(Request $request)
    {
        try {
            $variation = Variation::with('variation_items')->whereIn('branch_id', getBranchIds())->get();
            return $this->sendResponse($variation, 'Data retrieved successfully.');
        } catch (\Exception $e) {
            \Log::error('Variation fetch failed: ' . $e->getMessage());
            return $this->sendError('Failed to retrieve variations.', [], 500);
        }
    }

    /**
     * Show single product (ingredient)
     */
    public function show(Variation $variation)
    {
        return $this->sendResponse($variation, 'Variation retrieved successfully.');
    }

    /**
     * Store new product (ingredient)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required',
            'branch_id'     => 'required',
            'lines' => 'required|array',
            'lines.*.name' => 'nullable|string',
            'lines.*.price' => 'nullable|numeric',
        ]);

        DB::beginTransaction();
        try {
            $variation = new Variation();
            $variation->name = $validated['name'];
            $variation->branch_id = $validated['branch_id'];
            $variation->created_by = createdBy();
            $variation->save();

            foreach ($validated['lines'] as $lineData) {
                $item = new VariationItem();
                $item->variation_id = $variation->id;
                $item->name = $lineData['name'] ?? null;
                $item->price = $lineData['price'] ?? null;
                $item->save();
            }

            activityLog('variation','create','User '.auth()->user()->name.' created variation '.$variation->name);

            DB::commit();

            return $this->sendResponse($variation, 'Data saved successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Variation creation failed: ' . $e->getMessage());
            return $this->sendError('Failed to create variation.', [], 500);
        }

    }

    /**
     * Update product
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name'     => 'required',
            'branch_id'     => 'required',
            'lines' => 'required|array',
            'lines.*.name' => 'nullable|string',
            'lines.*.price' => 'nullable|numeric',
        ]);

        DB::beginTransaction();
        try {
            $variation = Variation::find($id);
            $variation->name = $validated['name'];
            $variation->branch_id = $validated['branch_id'];
            $variation->save();

            $variation->variation_items()->delete();

            // Use a different variable name inside the loop
            foreach ($validated['lines'] as $lineData) {
                $item = new VariationItem();
                $item->variation_id = $variation->id;
                $item->name = $lineData['name'] ?? null;
                $item->price = $lineData['price'] ?? null;
                $item->save();
            }

            activityLog('variation','update','User '.auth()->user()->name.' updated variation '.$variation->name);

            DB::commit();

            return $this->sendResponse($variation, 'Data saved successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Variation update failed: ' . $e->getMessage());
            return $this->sendError('Failed to update variation.', [], 500);
        }
    }


    /**
     * Delete product
     */
    public function destroy($id)
    {
        try {
            $variation = Variation::find($id);
            $variation->delete();
            activityLog('variation','deleted','User '.auth()->user()->name.' deleted variation '.$variation->name);
            return $this->sendResponse([], 'Data deleted successfully.');
        } catch (\Exception $e) {
            \Log::error('Variation deletion failed: ' . $e->getMessage());
            return $this->sendError('Failed to delete variation.', [], 500);
        }
    }
}
