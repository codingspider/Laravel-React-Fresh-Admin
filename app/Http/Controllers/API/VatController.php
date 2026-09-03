<?php

namespace App\Http\Controllers\API;

use App\Models\Vat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Http\Requests\VatSettingRequest;
use App\Http\Controllers\API\BaseController;
use Illuminate\Support\Facades\Log;

class VatController extends BaseController
{
    // List branches
    public function index()
    {
        try {
            $vats = Vat::with('branch')->get();
            return $this->sendResponse($vats, 'Data retrieved successfully.');
        } catch (\Exception $e) {
            \Log::error('VAT fetch failed: ' . $e->getMessage());
            return $this->sendError('Failed to retrieve VAT data.', [], 500);
        }
    }
    
    public function getVat()
    {
        try {
            $vats = Vat::with('branch')->get();
            return $this->sendResponse($vats, 'Data retrieved successfully.');
        } catch (\Exception $e) {
            \Log::error('VAT fetch failed: ' . $e->getMessage());
            return $this->sendError('Failed to retrieve VAT data.', [], 500);
        }
    }

    // Store new branch
    public function store(VatSettingRequest $request)
    {
        DB::beginTransaction();

        try {
            $data = $request->validated();
            $data['use_for'] = json_encode($data['use_for']);
            $data['created_by'] = auth()->user()->id;
            $branch = Vat::create($data);
            DB::commit();
            return $this->sendResponse($branch, 'Vat saved successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('VAT creation failed: ' . $e->getMessage());
            return $this->sendError('Failed to save VAT.', [], 500);
        }
    }

    // Show single branch
    public function show($id)
    {
        $vat = Vat::find($id);
        if (!$vat) {
            return $this->sendError('Vat not found.', [], 404);
        }
        return $this->sendResponse($vat, 'Vat retrieved successfully.');
    }

    // Update
    public function update(VatSettingRequest $request, $id)
    {
        DB::beginTransaction();
        try {
            $vat = Vat::find($id);
            if (!$vat) {
                return $this->sendError('Vat not found.', [], 404);
            }

            $vat->update($request->validated());
            DB::commit();
            return $this->sendResponse($vat, 'Vat saved successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('VAT update failed: ' . $e->getMessage());
            return $this->sendError('Failed to update VAT.', [], 500);
        }
    }

    // Delete
    public function destroy($id)
    {
        try {
            $vat = Vat::find($id);
            if (!$vat) {
                return $this->sendError('Vat not found.', [], 404);
            }
            $vat->delete();
            return $this->sendResponse([], 'Vat deleted successfully.');
        } catch (\Exception $e) {
            \Log::error('VAT deletion failed: ' . $e->getMessage());
            return $this->sendError('Failed to delete VAT.', [], 500);
        }
    }
}
