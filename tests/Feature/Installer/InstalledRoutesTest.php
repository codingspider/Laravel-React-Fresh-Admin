<?php

namespace Tests\Feature\Installer;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

/**
 * Feature tests for routes/web.php once the application IS installed
 * (storage/installed exists): the SPA catch-all, guest order page and
 * home route are active and installer routes are absent.
 */
class InstalledRoutesTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_renders_welcome_view(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertViewIs('welcome');
    }

    public function test_guest_order_page_renders(): void
    {
        $this->get('/order')
            ->assertOk()
            ->assertViewIs('guest');
    }

    public function test_catch_all_serves_spa_shell(): void
    {
        $this->get('/dashboard/settings/profile')
            ->assertOk()
            ->assertViewIs('welcome');
    }

    public function test_catch_all_excludes_api_prefix(): void
    {
        $this->get('/api/definitely-not-a-route')->assertNotFound();
    }

    public function test_catch_all_excludes_order_prefix(): void
    {
        $this->get('/order-extra')->assertNotFound();
    }

    public function test_installer_routes_are_absent_when_installed(): void
    {
        // /install falls through to the SPA catch-all, not an installer route.
        $this->get('/install')
            ->assertOk()
            ->assertViewIs('welcome');

        $this->assertFalse(Route::has('installer.index'));
        $this->assertFalse(Route::has('installer.start'));
    }
}
