<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Modules\Restaurant\Models\Restaurant;
use Modules\Branch\Models\Branch;
use Spatie\Permission\Models\Role;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Create Super Admin User (no restaurant link)
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@gmail.com'],
            [
                'name' => 'Super Admin',
                'email' => 'superadmin@gmail.com',
                'password' => Hash::make('123456789'),
                'email_verified_at' => now(),
            ]
        );
        $superAdmin->assignRole('super_admin');

        // Create Restaurant Owner User
        $restaurantOwner = User::firstOrCreate(
            ['email' => 'owner@gmail.com'],
            [
                'name' => 'Restaurant Owner',
                'email' => 'owner@gmail.com',
                'password' => Hash::make('123456789'),
                'email_verified_at' => now(),
            ]
        );
        $restaurantOwner->assignRole('restaurant_owner');

        // Create Restaurant (owned by restaurant owner)
        $restaurant = Restaurant::firstOrCreate(
            ['slug' => 'default-restaurant'],
            [
                'owner_id' => $restaurantOwner->id,
                'name' => 'Default Restaurant',
                'slug' => 'default-restaurant',
                'email' => 'restaurant@example.com',
                'phone' => '+1234567890',
                'address' => '123 Main Street',
                'city' => 'New York',
                'state' => 'NY',
                'country' => 'US',
                'zip_code' => '10001',
                'timezone' => 'America/New_York',
                'currency' => 'USD',
                'currency_symbol' => '$',
                'tax_rate' => 0,
                'tax_name' => 'Tax',
                'tax_inclusive' => false,
                'status' => 'active',
            ]
        );

        // Link restaurant owner to restaurant
        if (!$restaurantOwner->restaurant_id) {
            $restaurantOwner->update(['restaurant_id' => $restaurant->id]);
        }

        // Link super admin to restaurant
        if (!$superAdmin->restaurant_id) {
            $superAdmin->update(['restaurant_id' => $restaurant->id]);
        }

        // Create Main Branch
        Branch::firstOrCreate(
            ['slug' => 'main-branch'],
            [
                'restaurant_id' => $restaurant->id,
                'name' => 'Main Branch',
                'slug' => 'main-branch',
                'is_main' => true,
                'status' => 'active',
            ]
        );
    }
}
