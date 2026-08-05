<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Modules\TableManagement\Models\Table;
use Illuminate\Support\Str;

class GenerateTableQrTokens extends Command
{
    protected $signature = 'qr:generate-tokens {--regenerate : Regenerate tokens for all tables}';
    protected $description = 'Generate QR tokens for tables without one';

    public function handle(): int
    {
        $query = Table::query();

        if ($this->option('regenerate')) {
            $this->info('Regenerating QR tokens for all tables...');
        } else {
            $query->whereNull('qr_token')->orWhere('qr_token', '');
            $this->info('Generating QR tokens for tables without tokens...');
        }

        $tables = $query->get();
        $count = 0;

        foreach ($tables as $table) {
            $token = 'tbl_' . Str::random(32);
            $url = url("/order?table={$token}");

            $table->update([
                'qr_token' => $token,
                'qr_code_url' => $url,
            ]);

            $this->line("  {$table->name} (ID: {$table->id})");
            $this->line("    URL: {$url}");
            $this->newLine();
            $count++;
        }

        $this->info("Done! Updated {$count} table(s).");
        return 0;
    }
}
