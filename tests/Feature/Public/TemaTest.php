<?php

use App\Models\{Musica, Tema};

it('exibe a lista de temas', function () {
    Tema::factory()->count(3)->create();

    $this->get(route('temas.index'))->assertOk();
});

it('exibe as músicas de um tema', function () {
    $tema = Tema::factory()->create();
    Musica::factory()->count(5)->create()->each(fn ($m) => $m->temas()->attach($tema->id));

    $this->get(route('temas.show', $tema))->assertOk();
});
