<?php

return [
    'name' => 'Kitchen Display Module',
    'enabled' => true,

    /*
    |--------------------------------------------------------------------------
    | Kitchen Display Configuration
    |--------------------------------------------------------------------------
    |
    | delay_threshold_minutes: number of minutes an order can sit in the
    | kitchen before it is highlighted as "delayed" on the display.
    |
    | statuses: the order statuses shown on the kitchen board, in the order
    | they are rendered as columns. 'new' groups pending + confirmed.
    |
    */

    'delay_threshold_minutes' => 15,

    'statuses' => [
        'new' => ['pending', 'confirmed'],
        'preparing' => ['preparing'],
        'ready' => ['ready'],
    ],
];
