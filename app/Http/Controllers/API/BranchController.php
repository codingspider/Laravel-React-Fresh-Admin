<?php

namespace App\Http\Controllers\API;

use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Http\Requests\BranchRequest;
use App\Http\Controllers\API\BaseController;
use Illuminate\Support\Facades\Log;

class BranchController extends BaseController
{
    // List branches
    public function index()
    {
        try {
            $branches = Branch::orderBy('id', 'desc')->paginate(20);
            return $this->sendResponse($branches, 'Data retrieved successfully.');
        } catch (\Exception $e) {
            \Log::error('Branch fetch failed: ' . $e->getMessage());
            return $this->sendError('Failed to retrieve branches.', [], 500);
        }
    }
    
    public function getBranch()
    {
        try {
            $user = auth()->user();
            $branches = Branch::where('is_active', 1)->where('business_id', $user->business_id)->get();
            return $this->sendResponse($branches, 'Data retrieved successfully.');
        } catch (\Exception $e) {
            \Log::error('Branch fetch failed: ' . $e->getMessage());
            return $this->sendError('Failed to retrieve branches.', [], 500);
        }
    }

    // Store new branch
    public function store(BranchRequest $request)
    {
        DB::beginTransaction();

        try {
            $data = $request->validated();
            $data['created_by'] = createdBy();
            $data['business_id'] = auth()->user()->business_id;
            $branch = Branch::create($data);

            activityLog('branch','create','User '.auth()->user()->name.' created branch '.$branch->name);

            DB::commit();
            return $this->sendResponse($branch, 'Branch saved successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Branch creation failed: ' . $e->getMessage());
            return $this->sendError('Failed to save branch.', [], 500);
        }
    }

    // Show single branch
    public function show($id)
    {
        $branch = Branch::find($id);
        if (!$branch) {
            return $this->sendError('Branch not found.', [], 404);
        }
        return $this->sendResponse($branch, 'Branch retrieved successfully.');
    }

    // Update
    public function update(BranchRequest $request, $id)
    {
        DB::beginTransaction();
        try {
            $branch = Branch::find($id);
            if (!$branch) {
                return $this->sendError('Branch not found.', [], 404);
            }

            $branch->update($request->validated());

            activityLog('branch','update','User '.auth()->user()->name.' updated branch '.$branch->name);

            DB::commit();
            return $this->sendResponse($branch, 'Branch updated successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Branch update failed: ' . $e->getMessage());
            return $this->sendError('Failed to update branch.', [], 500);
        }
    }

    // Delete
    public function destroy($id)
    {
        try {
            $branch = Branch::find($id);
            if (!$branch) {
                return $this->sendError('Branch not found.', [], 404);
            }
            activityLog('branch','delete','User '.auth()->user()->name.' deleted branch '.$branch->name);
            $branch->delete();
            return $this->sendResponse([], 'Branch deleted successfully.');
        } catch (\Exception $e) {
            \Log::error('Branch deletion failed: ' . $e->getMessage());
            return $this->sendError('Failed to delete branch.', [], 500);
        }
    }
}
