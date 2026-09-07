<?php

use App\Models\{Lista, Musica, User};

it('gera token automaticamente ao criar', function () {
    $user  = User::factory()->create();
    $lista = Lista::create([
        'user_id' => $user->id,
        'nome'    => 'Missa Domingo',
    ]);

    expect($lista->token)->not->toBeNull()
        ->and(strlen($lista->token))->toBe(32);
});

it('pertence a um usuário', function () {
    $user  = User::factory()->create();
    $lista = Lista::factory()->create(['user_id' => $user->id]);

    expect($lista->user->id)->toBe($user->id);
});

it('tem relacionamento com músicas via pivot', function () {
    $lista   = Lista::factory()->create();
    $musicas = Musica::factory()->count(3)->create();

    foreach ($musicas as $i => $musica) {
        $lista->musicas()->attach($musica->id, [
            'ordem'      => $i + 1,
            'observacao' => "Nota {$i}",
        ]);
    }

    expect($lista->musicas)->toHaveCount(3)
        ->and($lista->musicas->first()->pivot->ordem)->toBe(1)
        ->and($lista->musicas->first()->pivot->observacao)->toBe('Nota 0');
});

it('incrementa visualizações', function () {
    $lista = Lista::factory()->create(['visualizacoes' => 0]);

    $lista->incrementarVisualizacoes();
    $lista->refresh();

    expect($lista->visualizacoes)->toBe(1);
});

it('faz cast de publica para boolean', function () {
    $lista = Lista::factory()->create(['publica' => true]);

    expect($lista->publica)->toBeBool()->toBeTrue();
});

it('gera URL de compartilhamento', function () {
    $lista = Lista::factory()->create();

    expect($lista->share_url)->toContain($lista->token);
});
