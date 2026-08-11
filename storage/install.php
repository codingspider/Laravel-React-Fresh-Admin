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