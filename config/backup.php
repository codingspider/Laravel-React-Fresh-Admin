<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Filesystem Disk
    |--------------------------------------------------------------------------
    |
    | The disk on which database backup files are stored.
    |
    */

    'disk' => env('BACKUP_DISK', 'local'),

    /*
    |--------------------------------------------------------------------------
    | Storage Folder
    |--------------------------------------------------------------------------
    |
    | Sub-folder inside the configured disk where backup files are written.
    |
    */

    'folder' => env('BACKUP_FOLDER', 'backups'),

    /*
    |--------------------------------------------------------------------------
    | File Prefix
    |--------------------------------------------------------------------------
    |
    | Prefix used for generated backup filenames, e.g. database-backup-2026-08-08.sql
    |
    */

    'prefix' => env('BACKUP_PREFIX', 'database-backup'),

    /*
    |--------------------------------------------------------------------------
    | Scheduled Backups
    |--------------------------------------------------------------------------
    |
    | When enabled, the scheduler runs the backup:run command daily at the
    | configured time (UTC). Backups are only created on the production
    | environment to avoid cluttering local development.
    |
    */

    'enable_schedule' => env('BACKUP_SCHEDULE_ENABLED', false),

    'schedule_at' => env('BACKUP_SCHEDULE_AT', '02:00'),

];
