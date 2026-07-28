<?php

namespace Modules\Currency\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Currency\Models\Currency;

class CurrencySeeder extends Seeder
{
    public function run(): void
    {
        $currencies = [
            ['name' => 'US Dollar', 'code' => 'USD', 'symbol' => '$', 'symbol_first' => true, 'decimal_mark' => '.', 'thousands_separator' => ',', 'precision' => 2],
            ['name' => 'Euro', 'code' => 'EUR', 'symbol' => '€', 'symbol_first' => true, 'decimal_mark' => ',', 'thousands_separator' => '.', 'precision' => 2],
            ['name' => 'British Pound', 'code' => 'GBP', 'symbol' => '£', 'symbol_first' => true, 'decimal_mark' => '.', 'thousands_separator' => ',', 'precision' => 2],
            ['name' => 'Bangladeshi Taka', 'code' => 'BDT', 'symbol' => '৳', 'symbol_first' => true, 'decimal_mark' => '.', 'thousands_separator' => ',', 'precision' => 2],
            ['name' => 'Indian Rupee', 'code' => 'INR', 'symbol' => '₹', 'symbol_first' => true, 'decimal_mark' => '.', 'thousands_separator' => ',', 'precision' => 2],
            ['name' => 'Pakistani Rupee', 'code' => 'PKR', 'symbol' => 'Rs', 'symbol_first' => true, 'decimal_mark' => '.', 'thousands_separator' => ',', 'precision' => 2],
            ['name' => 'Saudi Riyal', 'code' => 'SAR', 'symbol' => '﷼', 'symbol_first' => false, 'decimal_mark' => '.', 'thousands_separator' => ',', 'precision' => 2],
            ['name' => 'UAE Dirham', 'code' => 'AED', 'symbol' => 'د.إ', 'symbol_first' => false, 'decimal_mark' => '.', 'thousands_separator' => ',', 'precision' => 2],
            ['name' => 'Qatari Riyal', 'code' => 'QAR', 'symbol' => '﷼', 'symbol_first' => false, 'decimal_mark' => '.', 'thousands_separator' => ',', 'precision' => 2],
            ['name' => 'Kuwaiti Dinar', 'code' => 'KWD', 'symbol' => 'د.ك', 'symbol_first' => false, 'decimal_mark' => '.', 'thousands_separator' => ',', 'precision' => 3],
            ['name' => 'Canadian Dollar', 'code' => 'CAD', 'symbol' => 'C$', 'symbol_first' => true, 'decimal_mark' => '.', 'thousands_separator' => ',', 'precision' => 2],
            ['name' => 'Australian Dollar', 'code' => 'AUD', 'symbol' => 'A$', 'symbol_first' => true, 'decimal_mark' => '.', 'thousands_separator' => ',', 'precision' => 2],
            ['name' => 'Singapore Dollar', 'code' => 'SGD', 'symbol' => 'S$', 'symbol_first' => true, 'decimal_mark' => '.', 'thousands_separator' => ',', 'precision' => 2],
            ['name' => 'Malaysian Ringgit', 'code' => 'MYR', 'symbol' => 'RM', 'symbol_first' => true, 'decimal_mark' => '.', 'thousands_separator' => ',', 'precision' => 2],
            ['name' => 'Japanese Yen', 'code' => 'JPY', 'symbol' => '¥', 'symbol_first' => true, 'decimal_mark' => '.', 'thousands_separator' => ',', 'precision' => 0],
            ['name' => 'Chinese Yuan', 'code' => 'CNY', 'symbol' => '¥', 'symbol_first' => true, 'decimal_mark' => '.', 'thousands_separator' => ',', 'precision' => 2],
            ['name' => 'Turkish Lira', 'code' => 'TRY', 'symbol' => '₺', 'symbol_first' => true, 'decimal_mark' => ',', 'thousands_separator' => '.', 'precision' => 2],
            ['name' => 'Russian Ruble', 'code' => 'RUB', 'symbol' => '₽', 'symbol_first' => false, 'decimal_mark' => ',', 'thousands_separator' => ' ', 'precision' => 2],
            ['name' => 'Brazilian Real', 'code' => 'BRL', 'symbol' => 'R$', 'symbol_first' => true, 'decimal_mark' => ',', 'thousands_separator' => '.', 'precision' => 2],
            ['name' => 'South African Rand', 'code' => 'ZAR', 'symbol' => 'R', 'symbol_first' => true, 'decimal_mark' => '.', 'thousands_separator' => ' ', 'precision' => 2],
        ];

        foreach ($currencies as $currency) {
            Currency::updateOrCreate(
                ['code' => $currency['code']],
                $currency
            );
        }
    }
}
