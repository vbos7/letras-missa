<?php

use App\Models\{Lista, Musica, Tema, User};

beforeEach(function () {
    $this->admin = User::factory()->create(['is_admin' => true]);
});

it('bloqueia acesso de não-admin ao CRUD de músicas', function () {
    $user = User::factory()->create(['is_admin' => false]);

    $this->actingAs($user)
        ->get(route('admin.musicas.index'))
        ->assertRedirect('/');
});

it('lista músicas no painel admin', function () {
    Musica::factory()->count(5)->create();

    $this->actingAs($this->admin)
        ->get(route('admin.musicas.index'))
        ->assertOk();
});

it('exibe formulário de criação de música', function () {
    Tema::factory()->create();

    $this->actingAs($this->admin)
        ->get(route('admin.musicas.create'))
        ->assertOk();
});

it('cria uma nova música', function () {
    $tema = Tema::factory()->create();

    $this->actingAs($this->admin)
        ->post(route('admin.musicas.store'), [
            'numero'   => 100,
            'titulo'   => 'Santo',
            'letra'    => 'Santo, Santo, Santo...',
            'autor'    => 'Autor Teste',
            'tom'      => 'G',
            'tema_ids' => [$tema->id],
        ])
        ->assertRedirect(route('admin.musicas.index'));

    $this->assertDatabaseHas('musicas', [
        'numero' => 100,
        'titulo' => 'Santo',
    ]);
});

it('valida campos obrigatórios ao criar música', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.musicas.store'), [])
        ->assertSessionHasErrors(['numero', 'titulo', 'letra', 'tema_ids']);
});

it('valida número único da música', function () {
    $tema = Tema::factory()->create();
    Musica::factory()->create(['numero' => 100]);

    $this->actingAs($this->admin)
        ->post(route('admin.musicas.store'), [
            'numero'   => 100,
            'titulo'   => 'Outra Música',
            'letra'    => 'Letra...',
            'tema_ids' => [$tema->id],
        ])
        ->assertSessionHasErrors('numero');
});

it('exibe formulário de edição de música', function () {
    $musica = Musica::factory()->create();

    $this->actingAs($this->admin)
        ->get(route('admin.musicas.edit', $musica))
        ->assertOk();
});

it('atualiza uma música', function () {
    $musica = Musica::factory()->create();
    $temaId = $musica->temas->first()->id;

    $this->actingAs($this->admin)
        ->put(route('admin.musicas.update', $musica), [
            'numero'   => $musica->numero,
            'titulo'   => 'Título Atualizado',
            'letra'    => 'Nova letra...',
            'tema_ids' => [$temaId],
        ])
        ->assertRedirect(route('admin.musicas.index'));

    expect($musica->fresh()->titulo)->toBe('Título Atualizado');
});

it('exclui uma música sem listas', function () {
    $musica = Musica::factory()->create();

    $this->actingAs($this->admin)
        ->delete(route('admin.musicas.destroy', $musica))
        ->assertRedirect(route('admin.musicas.index'));

    $this->assertDatabaseMissing('musicas', ['id' => $musica->id]);
});

it('impede exclusão de música que está em uma lista', function () {
    $musica = Musica::factory()->create();
    $lista  = Lista::factory()->create();
    $lista->musicas()->attach($musica->id, ['ordem' => 1]);

    $this->actingAs($this->admin)
        ->delete(route('admin.musicas.destroy', $musica))
        ->assertRedirect();

    $this->assertDatabaseHas('musicas', ['id' => $musica->id]);
});
