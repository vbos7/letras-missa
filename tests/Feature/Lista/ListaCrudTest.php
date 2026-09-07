<?php

use App\Models\{Lista, User};

it('redireciona guest para login ao acessar listas', function () {
    $this->get(route('listas.index'))->assertRedirect(route('login'));
});

it('redireciona dashboard para listas.index para usuário comum', function () {
    $user = User::factory()->create(['is_admin' => false, 'is_colaborador' => false]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('listas.index'));
});

it('redireciona dashboard para colaborador.musicas.index para colaborador', function () {
    $colaborador = User::factory()->create(['is_colaborador' => true]);

    $this->actingAs($colaborador)
        ->get(route('dashboard'))
        ->assertRedirect(route('colaborador.musicas.index'));
});

it('exibe as listas do usuário autenticado', function () {
    $user = User::factory()->create();
    Lista::factory()->count(3)->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->get(route('listas.index'))
        ->assertOk();
});

it('exibe o formulário de criação de lista', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('listas.create'))
        ->assertOk();
});

it('cria uma nova lista', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('listas.store'), [
            'nome'    => 'Missa Domingo',
            'publica' => true,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('listas', [
        'user_id' => $user->id,
        'nome'    => 'Missa Domingo',
    ]);
});

it('valida nome obrigatório ao criar lista', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('listas.store'), [
            'nome' => '',
        ])
        ->assertSessionHasErrors('nome');
});

it('exibe o formulário de edição da lista', function () {
    $user  = User::factory()->create();
    $lista = Lista::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->get(route('listas.edit', $lista))
        ->assertOk();
});

it('atualiza uma lista', function () {
    $user  = User::factory()->create();
    $lista = Lista::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->put(route('listas.update', $lista), [
            'nome'    => 'Nome Atualizado',
            'publica' => false,
        ])
        ->assertRedirect();

    expect($lista->fresh()->nome)->toBe('Nome Atualizado')
        ->and($lista->fresh()->publica)->toBeFalse();
});

it('exclui uma lista', function () {
    $user  = User::factory()->create();
    $lista = Lista::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->delete(route('listas.destroy', $lista))
        ->assertRedirect(route('listas.index'));

    $this->assertDatabaseMissing('listas', ['id' => $lista->id]);
});

it('impede edição de lista de outro usuário', function () {
    $user      = User::factory()->create();
    $outroUser = User::factory()->create();
    $lista     = Lista::factory()->create(['user_id' => $outroUser->id]);

    $this->actingAs($user)
        ->get(route('listas.edit', $lista))
        ->assertForbidden();
});

it('impede exclusão de lista de outro usuário', function () {
    $user      = User::factory()->create();
    $outroUser = User::factory()->create();
    $lista     = Lista::factory()->create(['user_id' => $outroUser->id]);

    $this->actingAs($user)
        ->delete(route('listas.destroy', $lista))
        ->assertForbidden();
});
