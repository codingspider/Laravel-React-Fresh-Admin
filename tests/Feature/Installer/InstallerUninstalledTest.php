<?php

namespace Tests\Feature\Installer;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Feature tests for routes/web.php installer flow (application NOT yet installed).
 *
 * The installed flag is read from storage/installed when the route file boots,
 * so these tests move that file aside before the application is created and
 * restore it afterwards. Filesystem side effects (.env rewrites, install
 * marker files) are backed up and cleaned up in tearDown.
 */
class InstallerUninstalledTest extends TestCase
{
    use RefreshDatabase;

    protected bool $hadInstalledFile = false;
    protected ?string $envBackup = null;

    protected function setUp(): void
    {
        $installedPath = storage_path('installed');
        $this->hadInstalledFile = is_file($installedPath);

        if ($this->hadInstalledFile) {
            File::move($installedPath, storage_path('installed.testbak'));
        }

        parent::setUp();
    }

    protected function tearDown(): void
    {
        // RefreshDatabase rolls back at app destruction; make sure it targets
        // the sqlite test connection even if a test switched database.default.
        config(['database.default' => 'sqlite']);

        if ($this->envBackup !== null) {
            File::put(base_path('.env'), $this->envBackup);
            $this->envBackup = null;
        }

        foreach (['install_done', 'install_error', 'install.log', 'install.php'] as $marker) {
            File::delete(storage_path($marker));
        }

        File::delete(storage_path('installed'));

        if ($this->hadInstalledFile && is_file(storage_path('installed.testbak'))) {
            File::move(storage_path('installed.testbak'), storage_path('installed'));
        }

        parent::tearDown();
    }

    protected function backupEnv(): void
    {
        if ($this->envBackup === null && is_file(base_path('.env'))) {
            $this->envBackup = File::get(base_path('.env'));
        }
    }

    /**
     * Point database.default at an isolated probe connection so the installer's
     * testDatabaseConnection() (which purges and re-resolves the default
     * connection) can never disturb the RefreshDatabase-managed sqlite one.
     */
    protected function useProbeConnection(array $connection): void
    {
        config([
            'database.connections.installer_probe' => $connection,
            'database.default' => 'installer_probe',
        ]);
    }

    public function test_root_redirects_to_installer_when_not_installed(): void
    {
        $this->get('/')->assertRedirect(route('installer.index'));
    }

    public function test_step1_requirements_page_renders(): void
    {
        $response = $this->get(route('installer.index'));

        $response->assertOk()->assertViewIs('installer::installer.step1');
        $response->assertViewHas('phpVersionOk', true);
    }

    public function test_requirements_post_redirects_to_permissions(): void
    {
        $this->post(route('installer.requirements.post'))
            ->assertRedirect(route('installer.permissions'));
    }

    public function test_step2_permissions_page_renders(): void
    {
        $response = $this->get(route('installer.permissions'));

        $response->assertOk()->assertViewIs('installer::installer.step2');
        $response->assertViewHas('dirs');
    }

    public function test_permissions_post_redirects_to_environment(): void
    {
        $this->post(route('installer.permissions.post'))
            ->assertRedirect(route('installer.environment'));
    }

    public function test_step3_environment_page_renders(): void
    {
        $this->get(route('installer.environment'))
            ->assertOk()
            ->assertViewIs('installer::installer.step3');
    }

    public function test_environment_post_validates_required_fields(): void
    {
        $response = $this->post(route('installer.environment.post'), []);

        $response->assertSessionHasErrors(['APP_NAME', 'APP_URL', 'DB_HOST', 'DB_PORT', 'DB_DATABASE', 'DB_USERNAME']);
    }

    public function test_environment_post_rejects_unreachable_database(): void
    {
        $this->useProbeConnection([
            'driver' => 'mysql',
            'host' => '127.0.0.1',
            'port' => 1,
            'database' => 'installer_probe',
            'username' => 'probe',
            'password' => 'probe',
            'charset' => 'utf8mb4',
            'prefix' => '',
        ]);

        $response = $this->post(route('installer.environment.post'), [
            'APP_NAME' => 'Test App',
            'APP_URL' => 'http://test.local',
            'DB_HOST' => '127.0.0.1',
            'DB_PORT' => '1',
            'DB_DATABASE' => 'installer_test_no_db',
            'DB_USERNAME' => 'invalid_user',
            'DB_PASSWORD' => 'invalid_password',
        ]);

        $response->assertSessionHasErrors('DB_HOST');
    }

    public function test_environment_post_success_writes_env_and_redirects(): void
    {
        $this->backupEnv();

        $this->useProbeConnection(array_merge(
            config('database.connections.sqlite'),
            ['database' => ':memory:']
        ));

        $response = $this->post(route('installer.environment.post'), [
            'APP_NAME' => 'Installer Test App',
            'APP_URL' => 'http://test.local',
            'DB_HOST' => '127.0.0.1',
            'DB_PORT' => '3306',
            'DB_DATABASE' => ':memory:',
            'DB_USERNAME' => 'test',
            'DB_PASSWORD' => '',
        ]);

        $response->assertRedirect(route('installer.progress'));

        $env = File::get(base_path('.env'));

        $this->assertStringContainsString('APP_NAME="Installer Test App"', $env);
        $this->assertStringContainsString('APP_URL=http://test.local', $env);
        $this->assertStringContainsString('SANCTUM_STATEFUL_DOMAINS=test.local,localhost,127.0.0.1,test.local', $env);
        $this->assertMatchesRegularExpression('/^APP_KEY=base64:.+/m', $env);
    }

    public function test_progress_page_renders(): void
    {
        $this->get(route('installer.progress'))
            ->assertOk()
            ->assertViewIs('installer.progress');
    }

    public function test_check_progress_reports_running_by_default(): void
    {
        $this->get(route('installer.progress.check'))
            ->assertOk()
            ->assertJson(['status' => 'running']);
    }

    public function test_check_progress_reports_error_marker(): void
    {
        File::put(storage_path('install_error'), 'Migration failed');

        $this->get(route('installer.progress.check'))
            ->assertOk()
            ->assertJson(['status' => 'error', 'message' => 'Migration failed']);
    }

    public function test_check_progress_reports_completed_marker(): void
    {
        File::put(storage_path('install_done'), 'completed');

        $this->get(route('installer.progress.check'))
            ->assertOk()
            ->assertJson(['status' => 'completed']);
    }

    public function test_step4_admin_page_renders(): void
    {
        $this->get(route('installer.admin'))
            ->assertOk()
            ->assertViewIs('installer::installer.step4');
    }

    public function test_admin_post_validates_input(): void
    {
        $this->seedRolesAndPermissions();

        $this->post(route('installer.admin.post'), [
            'name' => '',
            'email' => 'not-an-email',
            'password' => 'short',
        ])->assertSessionHasErrors(['name', 'email', 'password']);
    }

    public function test_admin_post_creates_super_admin_and_marks_installed(): void
    {
        $this->seedRolesAndPermissions();
        $this->backupEnv();

        $response = $this->post(route('installer.admin.post'), [
            'name' => 'Installer Admin',
            'email' => 'admin@installer.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertRedirect('/');

        $user = User::where('email', 'admin@installer.test')->first();

        $this->assertNotNull($user);
        $this->assertTrue($user->hasRole('super_admin', 'web'));
        $this->assertFileExists(storage_path('installed'));
    }

    public function test_admin_post_rejects_duplicate_email(): void
    {
        $this->seedRolesAndPermissions();

        User::factory()->create(['email' => 'taken@installer.test']);

        $this->from(route('installer.admin'))
            ->post(route('installer.admin.post'), [
                'name' => 'Duplicate Admin',
                'email' => 'taken@installer.test',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ])
            ->assertSessionHasErrors('email');
    }

    public function test_start_installation_route_is_registered(): void
    {
        // Not executed: it spawns a background PHP process running migrate/seed
        // against the real .env database, which must never run inside tests.
        $this->assertTrue(Route::has('installer.start'));
    }

    public function test_spa_catch_all_is_not_registered_when_not_installed(): void
    {
        $this->get('/some/random/page')->assertNotFound();
    }
}
