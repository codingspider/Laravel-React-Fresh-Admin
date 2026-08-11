<?php

return [
    'prefix' => 'install',
    'as' => 'installer.',
    'namespace' => 'Modules\Installer\Http\Controllers',
    'middleware' => ['web'],
    'routes' => [
        [
            'method' => 'get',
            'uri' => '/',
            'action' => 'index',
            'name' => 'index',
        ],
        [
            'method' => 'post',
            'uri' => '/requirements',
            'action' => 'postRequirements',
            'name' => 'requirements.post',
        ],
        [
            'method' => 'get',
            'uri' => '/permissions',
            'action' => 'permissions',
            'name' => 'permissions',
        ],
        [
            'method' => 'post',
            'uri' => '/permissions',
            'action' => 'postPermissions',
            'name' => 'permissions.post',
        ],
        [
            'method' => 'get',
            'uri' => '/environment',
            'action' => 'environment',
            'name' => 'environment',
        ],
        [
            'method' => 'post',
            'uri' => '/environment',
            'action' => 'postEnvironment',
            'name' => 'environment.post',
        ],
        [
            'method' => 'get',
            'uri' => '/admin',
            'action' => 'admin',
            'name' => 'admin',
        ],
        [
            'method' => 'post',
            'uri' => '/admin',
            'action' => 'postAdmin',
            'name' => 'admin.post',
        ],
        [
            'method' => 'get',
            'uri' => '/complete',
            'action' => 'complete',
            'name' => 'complete',
        ],
    ],
];
