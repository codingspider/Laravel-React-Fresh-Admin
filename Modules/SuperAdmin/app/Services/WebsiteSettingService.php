<?php

namespace Modules\SuperAdmin\Services;

use Modules\SuperAdmin\Repositories\WebsiteSettingRepository;

class WebsiteSettingService
{
    /**
     * Default front website content used as a fallback so the public
     * landing page always has sensible values before any are saved.
     *
     * @return array<string, mixed>
     */
    public function defaults(): array
    {
        return [
            // Branding
            'site_name' => 'Restaurant POS',
            'site_tagline' => 'Run your entire restaurant from one powerful platform',
            'site_logo' => null,

            // Hero
            'hero_badge' => 'Trusted by 500+ restaurants',
            'hero_title' => 'The smartest way to run your restaurant',
            'hero_subtitle' => 'Take orders, process payments, manage tables and track everything in real time. All-in-one POS, kitchen, inventory and analytics for dine-in, takeaway, delivery and room service.',
            'hero_primary_cta_text' => 'Start Free Trial',
            'hero_primary_cta_url' => '/register',
            'hero_secondary_cta_text' => 'Explore Features',
            'hero_secondary_cta_url' => '#features',
            'hero_image' => null,

            // Hero stats
            'stat_1_value' => '0%',
            'stat_1_label' => 'Transaction fees',
            'stat_2_value' => '4',
            'stat_2_label' => 'Order types supported',
            'stat_3_value' => '<2s',
            'stat_3_label' => 'Order to kitchen',
            'stat_4_value' => '99.9%',
            'stat_4_label' => 'Uptime guarantee',

            // Contact
            'contact_email' => 'support@example.com',
            'contact_phone' => '+1 234 567 890',
            'contact_address' => '123 Main Street, New York, NY 10001',

            // Social
            'social_facebook' => null,
            'social_twitter' => null,
            'social_instagram' => null,
            'social_linkedin' => null,
            'social_youtube' => null,

            // Footer
            'footer_about' => 'The complete restaurant management platform. POS, QR ordering, digital menus, inventory, kitchen display and analytics — everything you need to run a restaurant efficiently.',
            'copyright_text' => 'All rights reserved.',
        ];
    }

    public function __construct(protected WebsiteSettingRepository $repository) {}

    /**
     * Stored settings merged over defaults.
     *
     * @return array<string, mixed>
     */
    public function all(): array
    {
        return array_merge($this->defaults(), $this->repository->allAsMap());
    }

    /**
     * Persist the given key/value pairs.
     *
     * @param array<string, mixed> $data
     */
    public function update(array $data): void
    {
        $allowed = array_keys($this->defaults());
        $payload = array_intersect_key($data, array_flip($allowed));

        $this->repository->setMany($payload);
    }
}
