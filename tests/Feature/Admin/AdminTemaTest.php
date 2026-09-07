<?php

use App\Models\{Musica, Tema, User};

beforeEach(function () {
    $this->admin = User::factory()->create(['is_admin' => true]);
});

it('bloqueia acesso de não-admin ao CRUD de temas', function () {
    $user = User::factory()->create(['is_admin' => false]);

    $this->actingAs($user)
        ->get(route('admin.temas.index'))
        ->assertRedirect('/');
});

it('lista temas no painel admin', function () {
    Tema::factory()->count(3)->create();

    $this->actingAs($this->admin)
        ->get(route('admin.temas.index'))
        ->assertOk();
});

it('exibe formulário de criação de tema', function () {
    $this->actingAs($this->admin)
        ->get(route('admin.temas.create'))
        ->assertOk();
});

it('cria um novo tema', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.temas.store'), [
            'nome'  => 'Entrada',
            'cor'   => '#FF0000',
            'ordem' => 1,
        ])
        ->assertRedirect(route('admin.temas.index'));

    $this->assertDatabaseHas('temas', [
        'nome' => 'Entrada',
        'slug' => 'entrada',
    ]);
});

it('valida campos obrigatórios ao criar tema', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.temas.store'), [])
        ->assertSessionHasErrors(['nome', 'cor']);
});

it('atualiza um tema', function () {
    $tema = Tema::factory()->create();

    $this->actingAs($this->admin)
        ->put(route('admin.temas.update', $tema), [
            'nome' => 'Comunhão',
            'cor'  => '#00FF00',
        ])
        ->assertRedirect(route('admin.temas.index'));

    expect($tema->fresh()->nome)->toBe('Comunhão')
        ->and($tema->fresh()->slug)->toBe('comunhao');
});

it('exclui um tema sem músicas', function () {
    $tema = Tema::factory()->create();

    $this->actingAs($this->admin)
        ->delete(route('admin.temas.destroy', $tema))
        ->assertRedirect(route('admin.temas.index'));

    $this->assertDatabaseMissing('temas', ['id' => $tema->id]);
});

it('impede exclusão de tema com músicas associadas', function () {
    $tema   = Tema::factory()->create();
    $musica = Musica::factory()->create();
    $musica->temas()->attach($tema->id);

    $this->actingAs($this->admin)
        ->delete(route('admin.temas.destroy', $tema))
        ->assertRedirect();

    $this->assertDatabaseHas('temas', ['id' => $tema->id]);
});
