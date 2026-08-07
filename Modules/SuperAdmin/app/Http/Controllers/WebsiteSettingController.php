<?php

namespace Modules\SuperAdmin\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use Modules\SuperAdmin\Services\WebsiteSettingService;

class WebsiteSettingController extends Controller
{
    public function __construct(protected WebsiteSettingService $service) {}

    /**
     * Public endpoint that powers the front website landing page.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'message' => trans('superadmin::module.settings_fetched'),
            'data' => $this->service->all(),
        ]);
    }

    /**
     * Persist front website content. Super admins only.
     */
    public function update(Request $request): JsonResponse
    {
        if (!isSuperAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => trans('superadmin::module.forbidden'),
            ], 403);
        }

        $keys = array_keys($this->service->defaults());

        $validator = Validator::make($request->all(), [
            'site_name' => 'nullable|string|max:255',
            'site_tagline' => 'nullable|string|max:500',
            'site_logo' => 'nullable|string|max:2048',
            'hero_badge' => 'nullable|string|max:255',
            'hero_title' => 'nullable|string|max:500',
            'hero_subtitle' => 'nullable|string|max:2000',
            'hero_primary_cta_text' => 'nullable|string|max:255',
            'hero_primary_cta_url' => 'nullable|string|max:500',
            'hero_secondary_cta_text' => 'nullable|string|max:255',
            'hero_secondary_cta_url' => 'nullable|string|max:500',
            'hero_image' => 'nullable|string|max:2048',
            'stat_1_value' => 'nullable|string|max:100',
            'stat_1_label' => 'nullable|string|max:255',
            'stat_2_value' => 'nullable|string|max:100',
            'stat_2_label' => 'nullable|string|max:255',
            'stat_3_value' => 'nullable|string|max:100',
            'stat_3_label' => 'nullable|string|max:255',
            'stat_4_value' => 'nullable|string|max:100',
            'stat_4_label' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:255',
            'contact_address' => 'nullable|string|max:1000',
            'social_facebook' => 'nullable|url|max:500',
            'social_twitter' => 'nullable|url|max:500',
            'social_instagram' => 'nullable|url|max:500',
            'social_linkedin' => 'nullable|url|max:500',
            'social_youtube' => 'nullable|url|max:500',
            'footer_about' => 'nullable|string|max:2000',
            'copyright_text' => 'nullable|string|max:500',
        ], [], array_combine($keys, $keys));

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => trans('superadmin::module.invalid_input'),
                'errors' => $validator->errors(),
            ], 422);
        }

        $this->service->update($request->only($keys));

        return response()->json([
            'status' => 'success',
            'message' => trans('superadmin::module.settings_updated'),
            'data' => $this->service->all(),
        ]);
    }
}
