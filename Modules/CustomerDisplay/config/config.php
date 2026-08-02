<?php

return [
    'name' => 'Customer Display Module',
    'enabled' => true,

    /*
    |--------------------------------------------------------------------------
    | Customer Display Configuration
    |--------------------------------------------------------------------------
    |
    | default_refresh_interval: number of seconds the public monitor waits
    | between polling the board endpoint for updates.
    |
    | active_statuses: order statuses shown on the public board, in the order
    | they should appear (newest first within each status).
    |
    | qr_upload_folder: folder (inside public/) where the admin-configured
    | payment QR image is stored.
    |
    */

    'default_refresh_interval' => 10,

    'active_statuses' => ['pending', 'confirmed', 'preparing', 'ready'],

    'qr_upload_folder' => 'uploads/customer-display',
];
