<?php

namespace Modules\Restaurant\Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Restaurant\Models\Restaurant;

/**
 * @extends Factory<Restaurant>
 */
class RestaurantFactory extends Factory
{
    protected $model = Restaurant::class;

    public function definition(): array
    {
        return [
            'owner_id' => User::factory(),
            'name' => $this->faker->company() . ' Restaurant',
            'slug' => 'restaurant-' . uniqid(),
            'phone' => $this->faker->phoneNumber(),
            'email' => $this->faker->unique()->safeEmail(),
            'timezone' => 'UTC',
            'currency' => 'USD',
            'currency_symbol' => '$',
            'tax_rate' => 0,
            'status' => 'active',
            'trial_ends_at' => now()->addDays(14),
        ];
    }
}