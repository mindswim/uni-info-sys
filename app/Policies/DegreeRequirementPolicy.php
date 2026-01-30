<?php

namespace App\Policies;

use App\Models\DegreeRequirement;
use App\Models\User;

class DegreeRequirementPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, DegreeRequirement $degreeRequirement): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin');
    }

    public function update(User $user, DegreeRequirement $degreeRequirement): bool
    {
        return $user->hasRole('admin');
    }

    public function delete(User $user, DegreeRequirement $degreeRequirement): bool
    {
        return $user->hasRole('admin');
    }
}
