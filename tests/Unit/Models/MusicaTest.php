<?php

use App\Models\{Lista, Musica, Tema, User};

it('tem relacionamento com temas', function () {
    $tema   = Tema::factory()->create();
    $musica = Musica::factory()->create();
    $musica->temas()->attach($tema->id);

    // Factory also attaches a tema in afterCreating, so musica has at least 2 temas
    expect($musica->fresh()->temas->pluck('id'))->toContain($tema->id);
});

it('tem relacionamento com listas', function () {
    $musica = Musica::factory()->create();
    $user   = User::factory()->create();
    $lista  = Lista::factory()->create(['user_id' => $user->id]);

    $lista->musicas()->attach($musica->id, ['ordem' => 1]);

    expect($musica->listas)->toHaveCount(1);
});

it('faz cast de ativo para boolean', function () {
    $musica = Musica::factory()->create(['ativo' => true]);

    expect($musica->ativo)->toBeBool()->toBeTrue();
});

it('filtra por busca com scope search', function () {
    Musica::factory()->create(['titulo' => 'Glória a Deus']);
    Musica::factory()->create(['titulo' => 'Santo']);
    Musica::factory()->create(['autor' => 'Padre Zezinho']);

    expect(Musica::search('Glória')->count())->toBe(1)
        ->and(Musica::search('Zezinho')->count())->toBe(1);
});

it('filtra por tema com scope byTema', function () {
    $tema      = Tema::factory()->create();
    $outroTema = Tema::factory()->create();

    $musicasComTema = Musica::factory()->count(3)->create();
    $musicasComTema->each(fn ($m) => $m->temas()->attach($tema->id));

    Musica::factory()->count(2)->create()->each(fn ($m) => $m->temas()->attach($outroTema->id));

    expect(Musica::byTema($tema->id)->count())->toBe(3);
});
