<?php

return [
    'required_php_version' => '8.1',

    'required_extensions' => [
        'pdo',
        'mbstring',
        'tokenizer',
        'xml',
        'json',
        'curl',
        'fileinfo',
        'bcmath',
        'ctype',
        'filter',
        'hash',
        'session',
        'openssl',
    ],

    'writable_dirs' => [
        'storage',
        'bootstrap/cache',
        'public/storage',
    ],
];
