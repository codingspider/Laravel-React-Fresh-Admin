        // Create Restaurant Owner User (linked to restaurant)
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

        // Create Restaurant
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

        // Update user with restaurant_id
        if (!$restaurantOwner->restaurant_id) {
            $restaurantOwner->update(['restaurant_id' => $restaurant->id]);
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