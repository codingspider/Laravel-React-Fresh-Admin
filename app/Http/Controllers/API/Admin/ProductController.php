<?php

namespace App\Http\Controllers\API\Admin;

use App\Models\Product;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreProductRequest;
use App\Http\Controllers\API\BaseController;

class ProductController extends BaseController
{
    private function defaultUnitId(): ?int
    {
        $unit = Unit::firstOrCreate(
            [
                'business_id' => user_business_id(),
                'short_name' => 'pc',
            ],
            [
                'actual_name' => 'Piece',
                'allow_decimal' => 0,
                'created_by' => createdBy(),
            ]
        );

        return $unit->id;
    }

    private function productPayload(array $data, ?Product $product = null): array
    {
        $mainImage = $product?->main_image;

        if (request()->hasFile('main_image')) {
            $mainImage = uploadImage(
                request()->file('main_image'),
                'uploads/product/image',
                $mainImage
            );
        }

        return [
            'name' => $data['name'],
            'business_id' => user_business_id(),
            'branch_id' => $data['branch_id'],
            'category_id' => $data['category_id'],
            'sequence_index' => $data['sequence_index'] ?? null,
            'sku' => $data['sku'] ?? $product?->sku ?? 'SKU-'.time(),
            'subtitle' => $data['subtitle'] ?? null,
            'product_description' => $data['description'] ?? null,
            'product_cost' => $data['product_cost'] ?? 0,
            'sell_price' => $data['sell_price'],
            'item_available_for' => json_encode($data['item_available_for'] ?? []),
            'featured_item' => !empty($data['featured_item']),
            'is_active' => (bool) $data['is_active'],
            'is_inactive' => empty($data['is_active']),
            'main_image' => $mainImage,
            'image' => $mainImage,
            'variations' => json_encode($data['variations'] ?? []),
            'addons' => json_encode($data['addons'] ?? []),
            'type' => $product?->type ?? 'single',
            'unit_id' => $product?->unit_id ?? $this->defaultUnitId(),
            'tax_type' => $product?->tax_type ?? 'exclusive',
            'barcode_type' => $product?->barcode_type ?? 'C128',
            'created_by' => $product?->created_by ?? createdBy(),
        ];
    }

    private function transformProduct(Product $product): array
    {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'branch_id' => $product->branch_id,
            'category_id' => $product->category_id,
            'sequence_index' => $product->sequence_index,
            'sku' => $product->sku,
            'subtitle' => $product->subtitle,
            'description' => $product->product_description,
            'product_cost' => $product->product_cost,
            'sell_price' => $product->sell_price,
            'item_available_for' => json_decode($product->item_available_for ?? '[]', true) ?: [],
            'featured_item' => (bool) $product->featured_item,
            'is_active' => (bool) $product->is_active,
            'main_image' => $product->image_url,
            'variations' => json_decode($product->variations ?? '[]', true) ?: [],
            'addons' => json_decode($product->addons ?? '[]', true) ?: [],
            'category' => $product->category ? [
                'id' => $product->category->id,
                'name' => $product->category->name,
            ] : null,
            'branch' => $product->branch ? [
                'id' => $product->branch->id,
                'name' => $product->branch->name,
            ] : null,
        ];
    }

    public function store(StoreProductRequest $request)
    {
        DB::beginTransaction();
        try {
            $data = $request->validated();
            $item = Product::create($this->productPayload($data));
            activityLog('product', 'create', 'User '.user_full_name().' created product '.$item->name);
            DB::commit();
            return $this->sendResponse($this->transformProduct($item->load(['category', 'branch'])), 'Product created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->sendError('Server Error. '.$e->getMessage(), [], 500);
        }
    }

    public function index(Request $request)
    {
        try {
            $query = Product::with(['category:id,name', 'branch:id,name'])
                ->where('business_id', user_business_id())
                ->when($request->filled('search'), function ($query) use ($request) {
                    $query->where(function ($query) use ($request) {
                        $query->where('name', 'like', '%'.$request->search.'%')
                            ->orWhere('sku', 'like', '%'.$request->search.'%');
                    });
                })
                ->orderBy('id', 'desc');

            $items = $query->paginate($request->integer('per_page', dataShowingNumber()))
                ->through(fn ($item) => $this->transformProduct($item));

            return $this->sendResponse($items, 'Products retrieved successfully.');
        } catch (\Exception $e) {
            return $this->sendError('Server Error: '.$e->getMessage());
        }
    }

    public function show(Product $product)
    {
        if ($product->business_id !== user_business_id()) {
            return $this->sendError('Product not found.', [], 404);
        }

        return $this->sendResponse($this->transformProduct($product->load(['category', 'branch'])), 'Product retrieved successfully.');
    }

    public function update(StoreProductRequest $request, Product $product)
    {
        if ($product->business_id !== user_business_id()) {
            return $this->sendError('Product not found.', [], 404);
        }

        DB::beginTransaction();
        try {
            $product->update($this->productPayload($request->validated(), $product));

            DB::commit();
            activityLog('product', 'update', 'User '.user_full_name().' updated product '.$product->name);

            return $this->sendResponse($this->transformProduct($product->fresh(['category', 'branch'])), 'Product updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->sendError('Server Error: '.$e->getMessage(), [], 500);
        }
    }
    

    public function destroy($id)
    {
        try {
            $product = Product::find($id);
            if (!$product || $product->business_id !== user_business_id()) {
                return $this->sendError('Product not found.', [], 404);
            }

            $product->delete();
            activityLog('product','deleted','User '.user_full_name().' deleted product '.$product->name);
            return $this->sendResponse([], 'Product deleted successfully.');
        } catch (\Exception $e) {
            return $this->sendError('Server Error: ' . $e->getMessage(), 500);
        }
    }
}
