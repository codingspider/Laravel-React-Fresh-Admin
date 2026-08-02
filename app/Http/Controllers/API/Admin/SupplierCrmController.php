<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use App\Models\SupplierContact;
use App\Models\SupplierTransaction;
use App\Services\SupplierService;
use Illuminate\Http\Request;

class SupplierCrmController extends Controller
{
    public function __construct(protected SupplierService $service) {}

    public function overview($id)
    {
        $supplier = Supplier::findOrFail($id);
        $this->authorizeOwnership($supplier);

        $data = $this->service->overview($id);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.supplier_overview_fetched'),
            'data' => $data,
        ]);
    }

    public function contacts($id)
    {
        $supplier = Supplier::findOrFail($id);
        $this->authorizeOwnership($supplier);

        return response()->json([
            'status' => 'success',
            'data' => $supplier->contacts()->orderBy('is_primary', 'desc')->get(),
        ]);
    }

    public function storeContact(Request $request, $id)
    {
        $supplier = Supplier::findOrFail($id);
        $this->authorizeOwnership($supplier);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'designation' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'is_primary' => 'nullable|boolean',
            'notes' => 'nullable|string',
        ]);

        if ($request->boolean('is_primary')) {
            $supplier->contacts()->update(['is_primary' => false]);
        }

        $contact = SupplierContact::create([
            'supplier_id' => $supplier->id,
            'name' => $validated['name'],
            'designation' => $validated['designation'] ?? null,
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'is_primary' => $request->boolean('is_primary') ?? false,
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.supplier_contact_created'),
            'data' => $contact,
        ], 201);
    }

    public function destroyContact($id, $contactId)
    {
        $supplier = Supplier::findOrFail($id);
        $this->authorizeOwnership($supplier);

        $contact = SupplierContact::where('supplier_id', $id)->findOrFail($contactId);
        $contact->delete();

        return response()->json([
            'status' => 'success',
            'message' => trans('message.supplier_contact_deleted'),
        ]);
    }

    public function documents($id)
    {
        $supplier = Supplier::findOrFail($id);
        $this->authorizeOwnership($supplier);

        return response()->json([
            'status' => 'success',
            'data' => $supplier->documents()->orderByDesc('id')->get(),
        ]);
    }

    public function storeDocument(Request $request, $id)
    {
        $supplier = Supplier::findOrFail($id);
        $this->authorizeOwnership($supplier);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'document_type' => 'nullable|string|max:255',
            'issue_date' => 'nullable|date',
            'expiry_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'file' => 'required|file|mimes:jpg,jpeg,png,pdf,doc,docx,xls,xlsx,webp|max:10240',
        ]);

        $document = $this->service->addDocument($supplier, $validated, $request->file('file'));

        return response()->json([
            'status' => 'success',
            'message' => trans('message.supplier_document_uploaded'),
            'data' => $document,
        ], 201);
    }

    public function destroyDocument($id, $documentId)
    {
        $supplier = Supplier::findOrFail($id);
        $this->authorizeOwnership($supplier);

        $document = $supplier->documents()->findOrFail($documentId);
        if ($document->file_path && file_exists(public_path($document->file_path))) {
            unlink(public_path($document->file_path));
        }
        $document->delete();

        return response()->json([
            'status' => 'success',
            'message' => trans('message.supplier_document_deleted'),
        ]);
    }

    public function transactions(Request $request, $id)
    {
        $supplier = Supplier::findOrFail($id);
        $this->authorizeOwnership($supplier);

        $transactions = SupplierTransaction::where('supplier_id', $id)
            ->orderByDesc('transaction_date')
            ->orderByDesc('id')
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $transactions,
        ]);
    }

    public function storeTransaction(Request $request, $id)
    {
        $supplier = Supplier::findOrFail($id);
        $this->authorizeOwnership($supplier);

        $validated = $request->validate([
            'type' => 'required|in:adjustment,credit_note,debit_note',
            'debit' => 'nullable|numeric|min:0',
            'credit' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'transaction_date' => 'nullable|date',
        ]);

        $transaction = SupplierTransaction::create([
            'restaurant_id' => $supplier->restaurant_id,
            'supplier_id' => $supplier->id,
            'type' => $validated['type'],
            'debit' => $validated['debit'] ?? 0,
            'credit' => $validated['credit'] ?? 0,
            'balance' => round(($validated['debit'] ?? 0) - ($validated['credit'] ?? 0), 2),
            'description' => $validated['description'] ?? null,
            'transaction_date' => $validated['transaction_date'] ?? now()->toDateString(),
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.supplier_transaction_created'),
            'data' => $transaction,
        ], 201);
    }

    public function rate(Request $request, $id)
    {
        $supplier = Supplier::findOrFail($id);
        $this->authorizeOwnership($supplier);

        $validated = $request->validate([
            'quality_rating' => 'nullable|integer|between:1,5',
            'delivery_rating' => 'nullable|integer|between:1,5',
            'price_rating' => 'nullable|integer|between:1,5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $rating = $this->service->addRating($supplier, $validated);

        return response()->json([
            'status' => 'success',
            'message' => trans('message.supplier_rated'),
            'data' => $rating,
        ]);
    }

    protected function authorizeOwnership(Supplier $supplier): void
    {
        $restaurantId = getRestaurantId();
        if ($restaurantId && $supplier->restaurant_id != $restaurantId) {
            abort(403, 'Unauthorized');
        }
    }
}
