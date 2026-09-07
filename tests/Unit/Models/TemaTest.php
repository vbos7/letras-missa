<?php

use App\Models\{Musica, Tema};

it('tem relacionamento com músicas', function () {
    $tema    = Tema::factory()->create();
    $musicas = Musica::factory()->count(3)->create();
    $musicas->each(fn ($m) => $m->temas()->attach($tema->id));

    expect($tema->fresh()->musicas)->toHaveCount(3);
});

it('preenche os campos corretamente', function () {
    $tema = Tema::factory()->create([
        'nome'  => 'Entrada',
        'slug'  => 'entrada',
        'cor'   => '#FF0000',
        'ordem' => 1,
    ]);

    expect($tema->nome)->toBe('Entrada')
        ->and($tema->slug)->toBe('entrada')
        ->and($tema->cor)->toBe('#FF0000')
        ->and($tema->ordem)->toBe(1);
});
