<?php

namespace App\Http\Controllers\API\Admin;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreProductRequest;
use App\Http\Controllers\Controller;
use Modules\Restaurant\Models\Restaurant;

class ProductController extends Controller
{
    private function productPayload(array $data, ?Product $product = null): array
    {
        $image = $product?->image;

        if (request()->hasFile('image')) {
            $image = uploadImage(
                request()->file('image'),
                'uploads/product/image',
                $image
            );
        }

        return [
            'restaurant_id' => $data['restaurant_id'] ?? $product?->restaurant_id,
            'branch_id' => $data['branch_id'] ?? null,
            'category_id' => $data['category_id'] ?? null,
            'name' => $data['name'],
            'sku' => $data['sku'] ?? $product?->sku ?? 'SKU-' . time(),
            'subtitle' => $data['subtitle'] ?? null,
            'description' => $data['description'] ?? null,
            'sell_price' => $data['sell_price'] ?? 0,
            'product_cost' => $data['product_cost'] ?? 0,
            'image' => $image,
            'item_available_for' => $data['item_available_for'] ?? ['dine_in'],
            'featured_item' => !empty($data['featured_item']),
            'is_active' => (bool) ($data['is_active'] ?? true),
            'sort_order' => $data['sort_order'] ?? 0,
            'status' => !empty($data['is_active']) ? 'active' : 'inactive',
        ];
    }

    public function store(StoreProductRequest $request)
    {
        DB::beginTransaction();
        try {
            $data = $request->validated();
            $restaurant = Restaurant::where('owner_id', $request->user()->id)->first();
            $data['restaurant_id'] = $restaurant?->id ?? $request->user()->id;

            $product = Product::create($this->productPayload($data));

            DB::commit();
            return response()->json([
                'status' => 'success',
                'message' => trans('message.product_created'),
                'data' => $product->fresh(['category', 'branch']),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Product creation failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create product.',
            ], 500);
        }
    }

    public function index(Request $request)
    {
        $query = Product::with(['category:id,name', 'branch:id,name']);

        if (!isSuperAdmin($request->user())) {
            $query->where('restaurant_id', $request->user()->id);
        }

        $query->when($request->filled('search'), function ($q) use ($request) {
            $q->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('sku', 'like', '%' . $request->search . '%');
            });
        });

        $products = $query->orderBy('id', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'status' => 'success',
            'message' => trans('message.product_fetched_list'),
            'data' => $products,
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    public function show($id)
    {
        $product = Product::with(['category:id,name', 'branch:id,name'])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.product_fetched'),
            'data' => $product,
        ]);
    }

    public function update(StoreProductRequest $request, $id)
    {
        $product = Product::findOrFail($id);

        DB::beginTransaction();
        try {
            $product->update($this->productPayload($request->validated(), $product));

            DB::commit();
            return response()->json([
                'status' => 'success',
                'message' => trans('message.product_updated'),
                'data' => $product->fresh(['category', 'branch']),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Product update failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update product.',
            ], 500);
        }
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json([
            'status' => 'success',
            'message' => trans('message.product_deleted'),
        ]);
    }
}
