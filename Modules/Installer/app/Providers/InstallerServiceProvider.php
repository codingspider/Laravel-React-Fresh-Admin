<?php

namespace Modules\Installer\Providers;

use Nwidart\Modules\Support\ModuleServiceProvider;

class InstallerServiceProvider extends ModuleServiceProvider
{
    protected string $name = 'Installer';

    protected string $nameLower = 'installer';

    public function boot(): void
    {
        $this->loadTranslationsFrom(__DIR__ . '/../../lang', $this->nameLower);
        $this->loadViewsFrom(__DIR__ . '/../../resources/views', 'installer');
    }
}
