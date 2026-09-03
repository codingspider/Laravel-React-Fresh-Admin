<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Modules\Restaurant\Models\Restaurant;
use Modules\Branch\Models\Branch;
use Spatie\Permission\Models\Role;
use Hash;

class InstallerService
{
    protected string $installedFile;

    public function __construct()
    {
        $this->installedFile = storage_path('installed');
    }

    public function isInstalled(): bool
    {
        return File::exists($this->installedFile);
    }

    public function checkPhpVersion(string $required): bool
    {
        return version_compare(PHP_VERSION, $required, '>=');
    }

    public function checkExtension(string $extension): bool
    {
        return extension_loaded($extension);
    }

    public function getRequiredExtensions(): array
    {
        return config('installer.required_extensions', []);
    }

    public function checkDirectoryWritable(string $directory): bool
    {
        $path = base_path($directory);

        if (!File::isDirectory($path)) {
            return false;
        }

        return is_writable($path);
    }

    public function fixDirectoryPermissions(string $directory): bool
    {
        $path = base_path($directory);

        if (!File::isDirectory($path)) {
            File::makeDirectory($path, 0755, true, true);
        }

        return chmod($path, 0755);
    }

    public function getWritableDirs(): array
    {
        return config('installer.writable_dirs', []);
    }

    public function testDatabaseConnection(array $config): bool
    {
        try {
            $connection = config('database.default');
            config([
                "database.connections.{$connection}.host" => $config['DB_HOST'],
                "database.connections.{$connection}.port" => $config['DB_PORT'],
                "database.connections.{$connection}.database" => $config['DB_DATABASE'],
                "database.connections.{$connection}.username" => $config['DB_USERNAME'],
                "database.connections.{$connection}.password" => $config['DB_PASSWORD'],
            ]);

            DB::purge($connection);

            return DB::connection($connection)->getPdo() !== null;
        } catch (\Exception $e) {
            return false;
        }
    }

    // before database migration
    public function writeEnvFile(array $data): bool
    {
        $envPath = base_path('.env');
        $envExample = base_path('.env.example');

        if (File::exists($envPath)) {
            $envContent = File::get($envPath);
        } elseif (File::exists($envExample)) {
            $envContent = File::get($envExample);
        } else {
            $envContent = $this->getDefaultEnvContent();
        }

        $replacements = [
            'APP_NAME' => $data['APP_NAME'] ?? 'Laravel',
            'APP_URL' => $data['APP_URL'] ?? 'http://localhost:8000',
            'DB_HOST' => $data['DB_HOST'] ?? '127.0.0.1',
            'DB_PORT' => $data['DB_PORT'] ?? '3306',
            'DB_DATABASE' => $data['DB_DATABASE'] ?? '',
            'DB_USERNAME' => $data['DB_USERNAME'] ?? '',
            'DB_PASSWORD' => $data['DB_PASSWORD'] ?? '',
            'SESSION_DRIVER' => $data['SESSION_DRIVER'] ?? 'file',
            'CACHE_STORE' => 'file',
            'QUEUE_CONNECTION' => 'sync',
        ];

        foreach ($replacements as $key => $value) {
            $envContent = $this->setEnvValue($envContent, $key, $value);
        }

        if (!str_contains($envContent, 'APP_KEY=')) {
            $envContent .= "\nAPP_KEY=\n";
        }

        $appUrl = $data['APP_URL'] ?? 'http://localhost';

        $envContent = $this->setEnvValue($envContent, 'VITE_API_URL', rtrim($appUrl, '/') . '/api');
        $envContent = $this->setEnvValue($envContent, 'FRONTEND_URL', $appUrl);
        $envContent = $this->setEnvValue($envContent, 'SANCTUM_STATEFUL_DOMAINS', $this->getStatefulDomains($appUrl));
        $envContent = $this->setEnvValue($envContent, 'SESSION_DOMAIN', $this->getSessionDomain($appUrl));
        $envContent = $this->setEnvValue($envContent, 'SESSION_SECURE_COOKIE', str_starts_with($appUrl, 'https://') ? 'true' : 'false');
        $envContent = $this->setEnvValue($envContent, 'PWA_NAME', $data['APP_NAME'] ?? 'Laravel');
        $envContent = $this->setEnvValue($envContent, 'PWA_SHORT_NAME', $data['APP_NAME'] ?? 'Laravel');

        return File::put($envPath, $envContent) !== false;
    }

    // after migration and seed
    public function updateEnvFile(): bool
    {
        $envPath = base_path('.env');
        $envExample = base_path('.env.example');

        if (File::exists($envPath)) {
            $envContent = File::get($envPath);
        } elseif (File::exists($envExample)) {
            $envContent = File::get($envExample);
        } else {
            $envContent = $this->getDefaultEnvContent();
        }

        $replacements = [
            'SESSION_DRIVER' => 'file',
            'CACHE_STORE' => 'file',
            'QUEUE_CONNECTION' => 'sync',
        ];

        foreach ($replacements as $key => $value) {
            $envContent = $this->setEnvValue($envContent, $key, $value);
        }

        // Ensure domain-related values stay consistent with APP_URL
        preg_match('/^APP_URL=(.*)/m', $envContent, $match);
        $appUrl = trim($match[1] ?? 'http://localhost');

        $envContent = $this->setEnvValue($envContent, 'VITE_API_URL', rtrim($appUrl, '/') . '/api');
        $envContent = $this->setEnvValue($envContent, 'FRONTEND_URL', $appUrl);
        $envContent = $this->setEnvValue($envContent, 'SANCTUM_STATEFUL_DOMAINS', $this->getStatefulDomains($appUrl));
        $envContent = $this->setEnvValue($envContent, 'SESSION_DOMAIN', $this->getSessionDomain($appUrl));
        $envContent = $this->setEnvValue($envContent, 'SESSION_SECURE_COOKIE', str_starts_with($appUrl, 'https://') ? 'true' : 'false');

        return File::put($envPath, $envContent) !== false;
    }

    protected function setEnvValue(string $env, string $key, string $value): string
    {
        $pattern = "/^{$key}=.*/m";
        $escapedValue = str_contains($value, ' ') ? '"' . $value . '"' : $value;

        if (preg_match($pattern, $env)) {
            return preg_replace($pattern, "{$key}={$escapedValue}", $env);
        }

        return $env . "\n{$key}={$escapedValue}\n";
    }

    protected function getStatefulDomains(string $appUrl): string
    {
        $host = parse_url($appUrl, PHP_URL_HOST);
        $frontEndHost = $host;
        $parts = explode('.', $host);
        if (count($parts) > 2) {
            array_shift($parts);
            $frontEndHost = implode('.', $parts);
        }

        return "{$host},localhost,127.0.0.1,{$frontEndHost}";
    }

    protected function getSessionDomain(string $appUrl): string
    {
        return parse_url($appUrl, PHP_URL_HOST) ?? 'localhost';
    }

    protected function getDefaultEnvContent(): string
    {
        return <<<'ENV'
        APP_NAME=Laravel
        APP_ENV=local
        APP_KEY=
        APP_DEBUG=true
        APP_TIMEZONE=UTC
        APP_URL=http://localhost

        APP_LOCALE=en
        APP_FALLBACK_LOCALE=en
        APP_FAKER_LOCALE=en_US

        APP_MAINTENANCE_DRIVER=file

        BCRYPT_ROUNDS=12

        LOG_CHANNEL=stack
        LOG_STACK=single
        LOG_DEPRECATIONS_CHANNEL=null
        LOG_LEVEL=debug

        DB_CONNECTION=mysql
        DB_HOST=127.0.0.1
        DB_PORT=3306
        DB_DATABASE=laravel
        DB_USERNAME=root
        DB_PASSWORD=

        SESSION_DRIVER=file
        SESSION_LIFETIME=120
        SESSION_ENCRYPT=false
        SESSION_PATH=/
        SESSION_DOMAIN=null

        BROADCAST_CONNECTION=log
        FILESYSTEM_DISK=local
        QUEUE_CONNECTION=sync

        CACHE_STORE=database
        CACHE_PREFIX=

        MAIL_MAILER=log
        MAIL_HOST=127.0.0.1
        MAIL_PORT=2525
        MAIL_USERNAME=null
        MAIL_PASSWORD=null
        MAIL_ENCRYPTION=null
        MAIL_FROM_ADDRESS="hello@example.com"
        MAIL_FROM_NAME="${APP_NAME}"

        VITE_APP_NAME="${APP_NAME}"
        ENV;
    }

    public function generateAppKey(): string
    {
        $existing = config('app.key');

        if (!empty($existing)) {
            return $existing;
        }

        $key = 'base64:' . base64_encode(random_bytes(32));

        $envPath = base_path('.env');
        if (File::exists($envPath)) {
            $envContent = File::get($envPath);
            $envContent = $this->setEnvValue($envContent, 'APP_KEY', $key);
            File::put($envPath, $envContent);
        }

        config(['app.key' => $key]);

        return $key;
    }

    public function createAdmin(array $data): User
    {

        $superAdminRole = Role::where('name', 'super_admin')
            ->where('guard_name', 'web')
            ->first();

        $ownerRole = Role::where('name', 'restaurant_owner')
            ->where('guard_name', 'web')
            ->first();

        // Create super admin user (from installer form)
        $superAdmin = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'email_verified_at' => now(),
        ]);

        Log::info('Installer: Super admin created with ID: ' . $superAdmin->id);

        if ($superAdminRole) {
            $superAdmin->assignRole($superAdminRole);
        }

        // Create restaurant owner user
        $ownerName = $data['owner_name'] ?? $data['name'] . ' Owner';
        $ownerEmail = $data['owner_email'] ?? 'owner@example.com';
        $ownerPassword = $data['owner_password'] ?? $data['password'];

        $restaurantOwner = User::create([
            'name' => $ownerName,
            'email' => $ownerEmail,
            'password' => Hash::make($ownerPassword),
            'email_verified_at' => now(),
        ]);

        Log::info('Installer: Restaurant owner created with ID: ' . $restaurantOwner->id);

        if ($ownerRole) {
            $restaurantOwner->assignRole($ownerRole);
        }

        // Create restaurant owned by restaurant owner
        $restaurant = Restaurant::create([
            'owner_id' => $restaurantOwner->id,
            'name' => config('installer.restaurant_name', $data['name'] . "'s Restaurant"),
            'slug' => 'default-restaurant',
            'email' => $ownerEmail,
            'phone' => '',
            'address' => '',
            'city' => '',
            'state' => '',
            'country' => 'US',
            'zip_code' => '',
            'timezone' => 'UTC',
            'currency' => 'USD',
            'currency_symbol' => '$',
            'tax_rate' => 0,
            'tax_name' => 'Tax',
            'tax_inclusive' => false,
            'status' => 'active',
        ]);

        // Link restaurant owner to restaurant
        $restaurantOwner->update(['restaurant_id' => $restaurant->id]);

        // Link super admin to restaurant
        $superAdmin->update(['restaurant_id' => $restaurant->id]);

        // Create main branch for the restaurant
        Branch::create([
            'restaurant_id' => $restaurant->id,
            'name' => 'Main Branch',
            'slug' => 'main-branch',
            'is_main' => true,
            'status' => 'active',
        ]);

        // Reload relationships
        $superAdmin->load('roles');

        return $superAdmin;
    }

    public function markAsInstalled(): bool
    {
        $content = "Installed at: " . now()->toDateTimeString() . "\n";
        $content .= "PHP Version: " . PHP_VERSION . "\n";
        $content .= "Laravel Version: " . app()->version() . "\n";

        return File::put($this->installedFile, $content) !== false;
    }

    public function fixAllDirectories(): void
    {
        foreach ($this->getWritableDirs() as $dir) {
            $this->fixDirectoryPermissions($dir);
        }
    }
}
