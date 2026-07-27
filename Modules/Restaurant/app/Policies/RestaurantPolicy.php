<?php

namespace Modules\Restaurant\Policies;

use App\Models\User;
use Modules\Restaurant\Models\Restaurant;

class RestaurantPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole(['super-admin', 'restaurant-owner']);
    }

    public function view(User $user, Restaurant $restaurant): bool
    {
        if ($user->hasRole('super-admin')) {
            return true;
        }
        return $user->restaurant_id === $restaurant->id || $user->id === $restaurant->owner_id;
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['super-admin', 'restaurant-owner']);
    }

    public function update(User $user, Restaurant $restaurant): bool
    {
        if ($user->hasRole('super-admin')) {
            return true;
        }
        return $user->id === $restaurant->owner_id;
    }

    public function delete(User $user, Restaurant $restaurant): bool
    {
        if ($user->hasRole('super-admin')) {
            return true;
        }
        return $user->id === $restaurant->owner_id;
    }
}
