<?php

namespace App\Console\Commands;

use App\Services\BackupService;
use Illuminate\Console\Command;
use Throwable;

class BackupDatabase extends Command
{
    protected $signature = 'backup:run';

    protected $description = 'Create a database backup file';

    public function handle(BackupService $service): int
    {
        $this->info('Creating database backup...');

        try {
            $backup = $service->create(null, 'schedule');
        } catch (Throwable $e) {
            $this->error('Backup failed: ' . $e->getMessage());

            return self::FAILURE;
        }

        $this->info("Backup created successfully: {$backup->filename}");

        return self::SUCCESS;
    }
}
