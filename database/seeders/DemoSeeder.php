<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Customer\Models\Customer;
use Modules\Menu\Models\MenuCategory;
use Modules\Menu\Models\MenuItem;
use Modules\Menu\Models\Modifier;
use Modules\Menu\Models\ModifierGroup;
use Modules\Restaurant\Models\Restaurant;
use Modules\Supplier\Models\Supplier;
use Modules\TableManagement\Models\Floor;
use Modules\TableManagement\Models\Table;
use Illuminate\Support\Str;

/**
 * DemoSeeder loads a set of demo records so the application can be
 * explored immediately after installation.
 *
 * The seeder is idempotent: running it more than once will not create
 * duplicate records.
 */
class DemoSeeder extends Seeder
{
    private const MENU_CATEGORIES = [
        'Appetizers' => [
            ['name' => 'Garlic Bread', 'price' => 5.99],
            ['name' => 'Chicken Wings', 'price' => 8.99],
            ['name' => 'Spring Rolls', 'price' => 6.49],
            ['name' => 'Bruschetta', 'price' => 7.49],
        ],
        'Main Course' => [
            ['name' => 'Grilled Chicken', 'price' => 14.99],
            ['name' => 'Beef Steak', 'price' => 18.99],
            ['name' => 'Pasta Alfredo', 'price' => 12.99],
            ['name' => 'Butter Chicken', 'price' => 13.49],
        ],
        'Pizzas' => [
            ['name' => 'Margherita Pizza', 'price' => 10.99],
            ['name' => 'Pepperoni Pizza', 'price' => 12.99],
            ['name' => 'Veggie Supreme', 'price' => 11.99],
        ],
        'Burgers' => [
            ['name' => 'Classic Burger', 'price' => 9.99],
            ['name' => 'Chicken Burger', 'price' => 8.99],
            ['name' => 'Double Cheese Burger', 'price' => 11.99],
        ],
        'Desserts' => [
            ['name' => 'Chocolate Lava Cake', 'price' => 6.99],
            ['name' => 'Tiramisu', 'price' => 7.49],
            ['name' => 'Cheesecake', 'price' => 6.49],
        ],
        'Beverages' => [
            ['name' => 'Fresh Lime Soda', 'price' => 3.49],
            ['name' => 'Cold Coffee', 'price' => 4.49],
            ['name' => 'Green Tea', 'price' => 2.99],
            ['name' => 'Fresh Orange Juice', 'price' => 4.99],
        ],
    ];

    private const FLOORS = [
        'Ground Floor' => ['sort_order' => 1],
        'First Floor' => ['sort_order' => 2],
        'Outdoor Terrace' => ['sort_order' => 3],
    ];

    private const TABLES = [
        'T1' => ['floor' => 'Ground Floor', 'capacity' => 2],
        'T2' => ['floor' => 'Ground Floor', 'capacity' => 4],
        'T3' => ['floor' => 'Ground Floor', 'capacity' => 4],
        'T4' => ['floor' => 'Ground Floor', 'capacity' => 6],
        'T5' => ['floor' => 'First Floor', 'capacity' => 2],
        'T6' => ['floor' => 'First Floor', 'capacity' => 4],
        'T7' => ['floor' => 'First Floor', 'capacity' => 8],
        'T8' => ['floor' => 'Outdoor Terrace', 'capacity' => 4],
        'T9' => ['floor' => 'Outdoor Terrace', 'capacity' => 4],
        'T10' => ['floor' => 'Outdoor Terrace', 'capacity' => 6],
    ];

    private const CUSTOMERS = [
        ['name' => 'John Smith', 'phone' => '+1 555-0101', 'email' => 'john.smith@example.com'],
        ['name' => 'Emily Johnson', 'phone' => '+1 555-0102', 'email' => 'emily.johnson@example.com'],
        ['name' => 'Michael Brown', 'phone' => '+1 555-0103', 'email' => 'michael.brown@example.com'],
        ['name' => 'Sarah Wilson', 'phone' => '+1 555-0104', 'email' => 'sarah.wilson@example.com'],
        ['name' => 'David Lee', 'phone' => '+1 555-0105', 'email' => 'david.lee@example.com'],
    ];

    private const SUPPLIERS = [
        ['name' => 'Fresh Farm Produce', 'status' => 'active'],
        ['name' => 'Prime Meats & Poultry', 'status' => 'active'],
        ['name' => 'Daily Bakery Supplies', 'status' => 'active'],
    ];

    public function run(): void
    {
        $restaurant = Restaurant::where('slug', 'default-restaurant')->first();

        if (!$restaurant) {
            $this->command->warn('DemoSeeder skipped: run "php artisan db:seed" first to create the default restaurant.');
            return;
        }

        $this->seedMenu($restaurant->id);
        $this->seedModifierGroups($restaurant->id);
        $this->seedFloorsAndTables($restaurant->id);
        $this->seedCustomers($restaurant->id);
        $this->seedSuppliers($restaurant->id);

        $this->command->info('Demo data seeded successfully!');
    }

    private function seedMenu(int $restaurantId): void
    {
        foreach (self::MENU_CATEGORIES as $categoryName => $items) {
            $category = MenuCategory::firstOrCreate(
                ['restaurant_id' => $restaurantId, 'slug' => Str::slug($categoryName)],
                [
                    'name' => $categoryName,
                    'status' => 'active',
                    'sort_order' => array_search($categoryName, array_keys(self::MENU_CATEGORIES), true),
                ]
            );

            foreach ($items as $index => $item) {
                MenuItem::firstOrCreate(
                    ['restaurant_id' => $restaurantId, 'slug' => Str::slug($item['name'])],
                    [
                        'menu_category_id' => $category->id,
                        'name' => $item['name'],
                        'price' => $item['price'],
                        'cost_price' => round($item['price'] * 0.4, 2),
                        'sku' => 'SKU-' . Str::upper(Str::slug($item['name'], '_')),
                        'preparation_time' => 15,
                        'sort_order' => $index,
                        'status' => 'active',
                    ]
                );
            }
        }
    }

    private function seedModifierGroups(int $restaurantId): void
    {
        $sizeGroup = ModifierGroup::firstOrCreate(
            ['restaurant_id' => $restaurantId, 'name' => 'Size'],
            ['is_required' => true, 'min_selections' => 1, 'max_selections' => 1, 'sort_order' => 1, 'status' => 'active']
        );

        foreach ([['name' => 'Small', 'price' => 0], ['name' => 'Medium', 'price' => 1.5], ['name' => 'Large', 'price' => 3]] as $index => $modifier) {
            Modifier::firstOrCreate(
                ['modifier_group_id' => $sizeGroup->id, 'name' => $modifier['name']],
                ['price' => $modifier['price'], 'sort_order' => $index, 'status' => 'active']
            );
        }

        $addonGroup = ModifierGroup::firstOrCreate(
            ['restaurant_id' => $restaurantId, 'name' => 'Add-Ons'],
            ['is_required' => false, 'min_selections' => 0, 'max_selections' => 3, 'sort_order' => 2, 'status' => 'active']
        );

        foreach ([['name' => 'Extra Cheese', 'price' => 1.99], ['name' => 'Extra Meat', 'price' => 2.99], ['name' => 'Mushrooms', 'price' => 1.49]] as $index => $modifier) {
            Modifier::firstOrCreate(
                ['modifier_group_id' => $addonGroup->id, 'name' => $modifier['name']],
                ['price' => $modifier['price'], 'sort_order' => $index, 'status' => 'active']
            );
        }

        $pizzaItems = MenuItem::where('restaurant_id', $restaurantId)
            ->whereIn('name', ['Margherita Pizza', 'Pepperoni Pizza', 'Veggie Supreme'])
            ->get();

        foreach ($pizzaItems as $item) {
            $item->modifierGroups()->syncWithoutDetaching([$sizeGroup->id, $addonGroup->id]);
        }
    }

    private function seedFloorsAndTables(int $restaurantId): void
    {
        $branch = \Modules\Branch\Models\Branch::where('restaurant_id', $restaurantId)->first();

        $floorIds = [];
        foreach (self::FLOORS as $floorName => $floorData) {
            $floor = Floor::firstOrCreate(
                ['restaurant_id' => $restaurantId, 'name' => $floorName],
                [
                    'branch_id' => $branch?->id,
                    'sort_order' => $floorData['sort_order'],
                    'status' => 'active',
                ]
            );
            $floorIds[$floorName] = $floor->id;
        }

        foreach (self::TABLES as $tableName => $tableData) {
            Table::firstOrCreate(
                ['restaurant_id' => $restaurantId, 'name' => $tableName],
                [
                    'branch_id' => $branch?->id,
                    'floor_id' => $floorIds[$tableData['floor']] ?? null,
                    'capacity' => $tableData['capacity'],
                    'status' => 'available',
                    'sort_order' => array_search($tableName, array_keys(self::TABLES), true),
                ]
            );
        }
    }

    private function seedCustomers(int $restaurantId): void
    {
        foreach (self::CUSTOMERS as $customer) {
            Customer::firstOrCreate(
                ['restaurant_id' => $restaurantId, 'phone' => $customer['phone']],
                [
                    'name' => $customer['name'],
                    'email' => $customer['email'],
                    'status' => 'active',
                ]
            );
        }
    }

    private function seedSuppliers(int $restaurantId): void
    {
        foreach (self::SUPPLIERS as $supplier) {
            Supplier::firstOrCreate(
                ['restaurant_id' => $restaurantId, 'name' => $supplier['name']],
                ['status' => $supplier['status']]
            );
        }
    }
}
