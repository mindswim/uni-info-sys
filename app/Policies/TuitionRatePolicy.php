<?php

namespace App\Policies;

use App\Models\TuitionRate;
use App\Models\User;

class TuitionRatePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasRole('staff');
    }

    public function view(User $user, TuitionRate $tuitionRate): bool
    {
        return $user->hasRole('admin') || $user->hasRole('staff');
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin');
    }

    public function update(User $user, TuitionRate $tuitionRate): bool
    {
        return $user->hasRole('admin');
    }

    public function delete(User $user, TuitionRate $tuitionRate): bool
    {
        return $user->hasRole('admin');
    }
}
