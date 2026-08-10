<?php

return [
    'name' => 'Notification Module',
    'enabled' => true,

    /*
    |--------------------------------------------------------------------------
    | Twilio
    |--------------------------------------------------------------------------
    |
    | Environment-level defaults for Twilio. When empty they fall back to the
    | per-branch credentials configured in the notification settings screen.
    |
    */
    'twilio' => [
        'sid' => env('TWILIO_SID'),
        'token' => env('TWILIO_TOKEN'),
        'sms_from' => env('TWILIO_SMS_FROM'),
        'whatsapp_from' => env('TWILIO_WHATSAPP_FROM'),
    ],
];
