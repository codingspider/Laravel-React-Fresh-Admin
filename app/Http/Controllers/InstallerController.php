<?php

namespace App\Http\Controllers;

use App\Services\InstallerService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class InstallerController extends Controller
{
    public function __construct(protected InstallerService $installer) {}

    public function index()
    {
        $phpVersionOk = $this->installer->checkPhpVersion(config('installer.required_php_version'));
        $extensions = [];
        foreach ($this->installer->getRequiredExtensions() as $ext) {
            $extensions[$ext] = $this->installer->checkExtension($ext);
        }

        return view('installer::installer.step1', compact('phpVersionOk', 'extensions'));
    }

    public function requirements()
    {
        return $this->index();
    }

    public function postRequirements(Request $request)
    {
        return redirect()->route('installer.permissions');
    }

    public function permissions()
    {
        $dirs = [];
        foreach ($this->installer->getWritableDirs() as $dir) {
            $dirs[$dir] = $this->installer->checkDirectoryWritable($dir);
        }

        return view('installer::installer.step2', compact('dirs'));
    }

    public function postPermissions(Request $request)
    {
        foreach ($this->installer->getWritableDirs() as $dir) {
            $this->installer->fixDirectoryPermissions($dir);
        }

        return redirect()->route('installer.environment');
    }

    public function environment()
    {
        $envData = [
            'APP_NAME' => env('APP_NAME', 'Laravel'),
            'APP_URL' => env('APP_URL', 'http://localhost'),
            'DB_HOST' => env('DB_HOST', '127.0.0.1'),
            'DB_PORT' => env('DB_PORT', '3306'),
            'DB_DATABASE' => env('DB_DATABASE', ''),
            'DB_USERNAME' => env('DB_USERNAME', ''),
            'DB_PASSWORD' => env('DB_PASSWORD', ''),
        ];

        return view('installer::installer.step3', compact('envData'));
    }

    public function postEnvironment(Request $request)
    {
        $validated = $request->validate([
            'APP_NAME' => 'required|string|max:255',
            'APP_URL' => 'required|url',
            'DB_HOST' => 'required|string|max:255',
            'DB_PORT' => 'required|integer',
            'DB_DATABASE' => 'required|string|max:255',
            'DB_USERNAME' => 'required|string|max:255',
            'DB_PASSWORD' => 'nullable|string',
        ]);

        if (!$this->installer->testDatabaseConnection($validated)) {
            return back()
                ->withErrors([
                    'DB_HOST' => 'Database connection failed.',
                ])
                ->withInput();
        }

        $this->installer->writeEnvFile($validated);
        $this->installer->generateAppKey();

        return redirect()->route('installer.progress');
    }

    public function startInstallation()
    {
        $scriptPath = storage_path('install.php');

        if (!File::exists($scriptPath)) {
            $script = <<<'PHP'
            <?php

            require __DIR__ . '/../vendor/autoload.php';

            $app = require_once __DIR__ . '/../bootstrap/app.php';

            $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

            try {
                set_time_limit(0);
                ini_set('memory_limit', '1024M');

                $kernel->call('migrate', [
                    '--force' => true,
                ]);

                file_put_contents(
                    __DIR__ . '/install.log',
                    $kernel->output()
                );

                $kernel->call('db:seed', [
                    '--force' => true,
                ]);

                file_put_contents(
                    __DIR__ . '/install_done',
                    'completed'
                );

            } catch (Throwable $e) {
                file_put_contents(
                    __DIR__ . '/install_error',
                    $e->getMessage()
                );
            }
            PHP;

            File::put($scriptPath, $script);
        }

        // Remove previous status files.
        File::delete([
            storage_path('install_done'),
            storage_path('install_error'),
            storage_path('install.log'),
        ]);

        $php = PHP_BINARY;

        if (PHP_OS_FAMILY === 'Windows') {
            $command = 'start /B "" "' . $php . '" "' . $scriptPath . '"';

            pclose(popen($command, 'r'));
        } else {
            $command = 'nohup "' . $php . '" "' . $scriptPath . '" > /dev/null 2>&1 &';

            exec($command);
        }

        return response()->json([
            'status' => 'started',
        ]);
    }

    function progress()
    {
        return view('installer.progress');
    }


    public function admin()
    {
        return view('installer::installer.step4');
    }

    public function checkProgress()
    {
        if (file_exists(storage_path('install_error'))) {
            return response()->json([
                'status' => 'error',
                'message' => file_get_contents(
                    storage_path('install_error')
                ),
            ]);
        }

        if (file_exists(storage_path('install_done'))) {
            return response()->json([
                'status' => 'completed',
            ]);
        }

        return response()->json([
            'status' => 'running',
        ]);
    }

    public function postAdmin(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        try {
            $this->installer->createAdmin($validated);
            $this->installer->markAsInstalled();

            return redirect()->to('/');
        } catch (\Exception $e) {
            dd($e->getMessage());
            return back()->withErrors(['error' => 'Failed to create admin: ' . $e->getMessage()])->withInput();
        }
    }

    public function complete()
    {
        return view('home');
    }
}
