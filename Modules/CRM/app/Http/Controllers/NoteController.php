<?php

namespace Modules\CRM\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\CRM\Http\Controllers\Traits\CrmAccess;
use Modules\CRM\Http\Requests\StoreNoteRequest;
use Modules\CRM\Http\Resources\NoteResource;
use Modules\CRM\Models\CrmNote;
use Modules\CRM\Services\NoteService;
use Modules\Customer\Models\Customer;

class NoteController extends Controller
{
    use CrmAccess;

    protected string $langKey = 'crm::module';

    public function __construct(protected NoteService $service) {}

    public function index(Request $request, int $customerId): JsonResponse
    {
        $this->authorizeAction($request, 'view_customer_notes');

        $customer = Customer::findOrFail($customerId);
        $this->ensureOwned($customer->restaurant_id, $this->restaurantId($request));

        $notes = $this->service->forCustomer($customerId, $customer->restaurant_id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.notes_fetched'),
            'data' => NoteResource::collection($notes),
        ]);
    }

    public function store(StoreNoteRequest $request, int $customerId): JsonResponse
    {
        $this->authorizeAction($request, 'create_customer_notes');

        $customer = Customer::findOrFail($customerId);
        $this->ensureOwned($customer->restaurant_id, $this->restaurantId($request));

        $data = $request->validated();
        $data['restaurant_id'] = $customer->restaurant_id;
        $data['customer_id'] = $customerId;
        $data['created_by'] = $request->user()->id;

        $note = $this->service->create($data);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.note_created'),
            'data' => new NoteResource($note->load('creator:id,name')),
        ], 201);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $this->authorizeAction($request, 'delete_customer_notes');

        $note = $this->service->find($id);
        $this->ensureOwned($note->restaurant_id, $this->restaurantId($request));

        $this->service->delete($id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.note_deleted'),
        ]);
    }
}
