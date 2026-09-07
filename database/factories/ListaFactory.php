<?php

namespace Database\Factories;

use App\Models\{Lista, User};
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Lista>
 */
class ListaFactory extends Factory
{
    protected $model = Lista::class;

    public function definition(): array
    {
        return [
            'user_id'       => User::factory(),
            'nome'          => fake()->sentence(2),
            'token'         => Str::random(32),
            'publica'       => true,
            'visualizacoes' => 0,
        ];
    }

    public function privada(): static
    {
        return $this->state(fn (array $attributes) => [
            'publica' => false,
        ]);
    }
}
