<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Role;

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
            'APP_URL' => $data['APP_URL'] ?? 'http://localhost',
            'FRONTEND_URL' => $data['FRONTEND_URL'] ?? ($data['APP_URL'] ?? 'http://localhost') . ':5173',
            'DB_HOST' => $data['DB_HOST'] ?? '127.0.0.1',
            'DB_PORT' => $data['DB_PORT'] ?? '3306',
            'DB_DATABASE' => $data['DB_DATABASE'] ?? '',
            'DB_USERNAME' => $data['DB_USERNAME'] ?? '',
            'DB_PASSWORD' => $data['DB_PASSWORD'] ?? '',
            'SESSION_DRIVER' => 'file',
            'CACHE_STORE' => 'file',
            'QUEUE_CONNECTION' => 'sync',
        ];

        foreach ($replacements as $key => $value) {
            $envContent = $this->setEnvValue($envContent, $key, $value);
        }

        if (!str_contains($envContent, 'APP_KEY=')) {
            $envContent .= "\nAPP_KEY=\n";
        }

        $envContent = $this->setEnvValue($envContent, 'SANCTUM_STATEFUL_DOMAINS', $this->getStatefulDomains($data['APP_URL'] ?? 'http://localhost'));
        $envContent = $this->setEnvValue($envContent, 'SESSION_DOMAIN', $this->getSessionDomain($data['APP_URL'] ?? 'http://localhost'));
        $envContent = $this->setEnvValue($envContent, 'VITE_API_URL', ($data['APP_URL'] ?? 'http://localhost') . '/api');
        $envContent = $this->setEnvValue($envContent, 'PWA_NAME', $data['APP_NAME'] ?? 'Laravel');
        $envContent = $this->setEnvValue($envContent, 'PWA_SHORT_NAME', $data['APP_NAME'] ?? 'Laravel');

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
        Log::info('Installer: Looking for super_admin role...');

        $role = Role::where('name', 'super_admin')->first();

        Log::info('Installer: Role found: ' . ($role ? $role->name : 'none'));

        Log::info('Installer: Creating user: ' . $data['email']);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => bcrypt($data['password']),
            'email_verified_at' => now(),
        ]);

        Log::info('Installer: User created with ID: ' . $user->id);

        if ($role) {
            $user->assignRole($role);

            Log::info('Installer: Role assigned to user.');
        }

        return $user;
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
