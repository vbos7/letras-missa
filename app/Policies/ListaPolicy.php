<?php

namespace App\Policies;

use App\Models\{Lista, User};

class ListaPolicy
{
    public function update(User $user, Lista $lista): bool
    {
        return $user->id === $lista->user_id;
    }

    public function delete(User $user, Lista $lista): bool
    {
        return $user->id === $lista->user_id;
    }
}
