<?php

use App\Models\{Lista, Musica, User};

it('adiciona música a uma lista', function () {
    $user   = User::factory()->create();
    $lista  = Lista::factory()->create(['user_id' => $user->id]);
    $musica = Musica::factory()->create();

    $this->actingAs($user)
        ->post(route('musicas.adicionar', $lista), [
            'musica_id' => $musica->id,
        ])
        ->assertRedirect();

    expect($lista->musicas)->toHaveCount(1);
});

it('não adiciona música duplicada na lista', function () {
    $user   = User::factory()->create();
    $lista  = Lista::factory()->create(['user_id' => $user->id]);
    $musica = Musica::factory()->create();

    $lista->musicas()->attach($musica->id, ['ordem' => 1]);

    $this->actingAs($user)
        ->post(route('musicas.adicionar', $lista), [
            'musica_id' => $musica->id,
        ])
        ->assertRedirect();

    expect($lista->musicas()->count())->toBe(1);
});

it('remove música de uma lista', function () {
    $user   = User::factory()->create();
    $lista  = Lista::factory()->create(['user_id' => $user->id]);
    $musica = Musica::factory()->create();
    $lista->musicas()->attach($musica->id, ['ordem' => 1]);

    $this->actingAs($user)
        ->delete(route('musicas.remover', [$lista, $musica]))
        ->assertRedirect();

    expect($lista->musicas()->count())->toBe(0);
});

it('reordena músicas de uma lista', function () {
    $user    = User::factory()->create();
    $lista   = Lista::factory()->create(['user_id' => $user->id]);
    $musicas = Musica::factory()->count(3)->create();

    foreach ($musicas as $i => $musica) {
        $lista->musicas()->attach($musica->id, ['ordem' => $i + 1]);
    }

    $this->actingAs($user)
        ->post(route('reordenar', $lista), [
            'musicas' => [
                ['id' => $musicas[2]->id, 'ordem' => 1],
                ['id' => $musicas[0]->id, 'ordem' => 2],
                ['id' => $musicas[1]->id, 'ordem' => 3],
            ],
        ])
        ->assertRedirect();

    $lista->load('musicas');
    expect($lista->musicas->first()->id)->toBe($musicas[2]->id);
});

it('impede outro usuário de adicionar música na lista', function () {
    $user      = User::factory()->create();
    $outroUser = User::factory()->create();
    $lista     = Lista::factory()->create(['user_id' => $outroUser->id]);
    $musica    = Musica::factory()->create();

    $this->actingAs($user)
        ->post(route('musicas.adicionar', $lista), [
            'musica_id' => $musica->id,
        ])
        ->assertForbidden();
});
