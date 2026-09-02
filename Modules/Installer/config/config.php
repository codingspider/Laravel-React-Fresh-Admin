<?php

return [
    'required_php_version' => '8.4',
    'required_extensions' => [
        'openssl',
        'pdo',
        'mbstring',
        'tokenizer',
        'json',
        'curl',
        'xml',
        'bcmath',
        'gd',
        'zip',
    ],
    'writable_dirs' => [
        'storage/framework/',
        'storage/framework/sessions/',
        'storage/framework/views/',
        'storage/framework/cache/',
        'storage/logs/',
        'bootstrap/cache/',
    ],
];
