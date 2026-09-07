<?php

use App\Models\{Musica, Tema};

it('exibe o catálogo de músicas', function () {
    Tema::factory()->create();
    Musica::factory()->count(3)->create(['ativo' => true]);

    $this->get(route('musicas.index'))->assertOk();
});

it('exibe apenas músicas ativas no catálogo', function () {
    Musica::factory()->count(2)->create(['ativo' => true]);
    Musica::factory()->create(['ativo' => false]);

    $response = $this->get(route('musicas.index'));

    $response->assertOk();

    $props = $response->original->getData()['page']['props'];
    expect($props['musicas'])->toHaveCount(2);
});

it('exibe detalhes de uma música', function () {
    $musica = Musica::factory()->create();

    $this->get(route('musicas.show', $musica))->assertOk();
});
