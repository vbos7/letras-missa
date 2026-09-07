<?php

use App\Models\{Lista, User};

it('identifica corretamente um admin', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $user  = User::factory()->create(['is_admin' => false]);

    expect($admin->isAdmin())->toBeTrue()
        ->and($user->isAdmin())->toBeFalse();
});

it('tem relacionamento com listas', function () {
    $user = User::factory()->create();
    Lista::factory()->count(3)->create(['user_id' => $user->id]);

    expect($user->listas)->toHaveCount(3);
});

it('esconde campos sensíveis na serialização', function () {
    $user  = User::factory()->create();
    $array = $user->toArray();

    expect($array)->not->toHaveKey('password')
        ->not->toHaveKey('remember_token')
        ->not->toHaveKey('two_factor_secret')
        ->not->toHaveKey('two_factor_recovery_codes');
});
