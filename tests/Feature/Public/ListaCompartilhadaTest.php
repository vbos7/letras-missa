<?php

use App\Models\{Lista, Musica};

it('exibe uma lista compartilhada pública', function () {
    $lista  = Lista::factory()->create(['publica' => true]);
    $musica = Musica::factory()->create();
    $lista->musicas()->attach($musica->id, ['ordem' => 1]);

    $this->get(route('listas.compartilhada', $lista->token))->assertOk();
});

it('incrementa visualizações ao acessar lista compartilhada', function () {
    $lista = Lista::factory()->create(['publica' => true, 'visualizacoes' => 5]);

    $this->get(route('listas.compartilhada', $lista->token));

    expect($lista->fresh()->visualizacoes)->toBe(6);
});

it('retorna 404 para lista privada', function () {
    $lista = Lista::factory()->privada()->create();

    $this->get(route('listas.compartilhada', $lista->token))->assertNotFound();
});

it('retorna 404 para token inválido', function () {
    $this->get(route('listas.compartilhada', 'token-inexistente'))->assertNotFound();
});
