<?php

namespace Modules\Restaurant\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Modules\Restaurant\Http\Requests\StoreRestaurantRequest;
use Modules\Restaurant\Http\Requests\UpdateRestaurantRequest;
use Modules\Restaurant\Http\Requests\UpdateTaxSettingsRequest;
use Modules\Restaurant\Http\Requests\UpdateWorkingHoursRequest;
use Modules\Restaurant\Resources\RestaurantResource;
use Modules\Restaurant\Services\RestaurantService;
use Spatie\Permission\Models\Role;

class RestaurantController extends Controller
{
    protected string $langKey = 'restaurant::module';

    public function __construct(protected RestaurantService $service) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'status', 'owner_id']);

        $restaurantId = getRestaurantId();
        if ($restaurantId) {
            $filters['id'] = $restaurantId;
        }

        $data = $this->service->paginate(
            $request->input('per_page', 15),
            $filters
        );

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched_list'),
            'data' => RestaurantResource::collection($data),
            'meta' => [
                'current_page' => $data->currentPage(),
                'last_page' => $data->lastPage(),
                'per_page' => $data->perPage(),
                'total' => $data->total(),
            ],
        ]);
    }

    public function store(StoreRestaurantRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['owner_id'] = $request->user()->id;

        $createOwner = $data['create_owner'] ?? false;

        DB::beginTransaction();

        try {
            $restaurant = $this->service->create($data);

            if ($createOwner) {
                $ownerUser = User::create([
                    'name'          => $data['owner_name'],
                    'email'         => $data['owner_email'],
                    'password'      => Hash::make($data['owner_password']),
                    'restaurant_id' => $restaurant->id,
                ]);

                $ownerRole = Role::where('name', 'restaurant_owner')->where('guard_name', 'web')->first();
                if ($ownerRole) {
                    $ownerUser->assignRole($ownerRole);
                }

                $restaurant->update(['owner_id' => $ownerUser->id]);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => trans($this->langKey . '.created'),
                'data' => new RestaurantResource($restaurant->fresh()),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => trans($this->langKey . '.creation_failed'),
            ], 500);
        }
    }

    public function show($id): JsonResponse
    {
        $restaurant = $this->service->find($id);
        if (getRestaurantId() && $restaurant->id != getRestaurantId()) {
            abort(403, 'Unauthorized');
        }

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.fetched'),
            'data' => new RestaurantResource($restaurant),
        ]);
    }

    public function update(UpdateRestaurantRequest $request, $id): JsonResponse
    {
        $restaurant = $this->service->find($id);
        if (getRestaurantId() && $restaurant->id != getRestaurantId()) {
            abort(403, 'Unauthorized');
        }

        $restaurant = $this->service->update($id, $request->validated());

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.updated'),
            'data' => new RestaurantResource($restaurant),
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $restaurant = $this->service->find($id);
        if (getRestaurantId() && $restaurant->id != getRestaurantId()) {
            abort(403, 'Unauthorized');
        }

        $this->service->delete($id);

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.deleted'),
        ]);
    }

    public function updateWorkingHours(UpdateWorkingHoursRequest $request, $id): JsonResponse
    {
        $restaurant = $this->service->find($id);
        if (getRestaurantId() && $restaurant->id != getRestaurantId()) {
            abort(403, 'Unauthorized');
        }

        $restaurant = $this->service->updateWorkingHours($id, $request->input('working_hours'));

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.settings_updated'),
            'data' => new RestaurantResource($restaurant),
        ]);
    }

    public function updateTaxSettings(UpdateTaxSettingsRequest $request, $id): JsonResponse
    {
        $restaurant = $this->service->find($id);
        if (getRestaurantId() && $restaurant->id != getRestaurantId()) {
            abort(403, 'Unauthorized');
        }

        $restaurant = $this->service->updateTaxSettings($id, $request->only([
            'tax_rate', 'tax_name', 'tax_inclusive',
        ]));

        return response()->json([
            'status' => 'success',
            'message' => trans($this->langKey . '.tax_settings_updated'),
            'data' => new RestaurantResource($restaurant),
        ]);
    }
}
