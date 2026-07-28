<?php

namespace App\Http\Controllers\API\Admin;

use App\Models\Supplier;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Modules\Restaurant\Models\Restaurant;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $query = Supplier::query();

        if (!isSuperAdmin($request->user())) {
            $query->where('restaurant_id', $request->user()->id);
        }

        $query->when($request->filled('search'), function ($q) use ($request) {
            $q->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('company', 'like', '%' . $request->search . '%');
            });
        });

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $suppliers = $query->orderBy('name')
            ->paginate($request->input('per_page', 100));

        return response()->json([
            'status' => 'success',
            'message' => trans('message.suppliers_fetched'),
            'data' => $suppliers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:1000',
            'is_active' => 'nullable|boolean',
        ]);

        $restaurant = Restaurant::where('owner_id', $request->user()->id)->first();
        $validated['restaurant_id'] = $restaurant?->id ?? $request->user()->id;
        $validated['is_active'] = $validated['is_active'] ?? true;

        $supplier = Supplier::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.supplier_created'),
            'data' => $supplier,
        ], 201);
    }

    public function show($id)
    {
        $supplier = Supplier::findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $supplier,
        ]);
    }

    public function update(Request $request, $id)
    {
        $supplier = Supplier::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'company' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:1000',
            'is_active' => 'nullable|boolean',
        ]);

        $supplier->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.supplier_updated'),
            'data' => $supplier,
        ]);
    }

    public function destroy($id)
    {
        $supplier = Supplier::findOrFail($id);
        $supplier->delete();

        return response()->json([
            'status' => 'success',
            'message' => trans('message.supplier_deleted'),
        ]);
    }
}
