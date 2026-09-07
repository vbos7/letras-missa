<?php

namespace Database\Factories;

use App\Models\{Musica, Tema};
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Musica>
 */
class MusicaFactory extends Factory
{
    protected $model = Musica::class;

    public function definition(): array
    {
        return [
            'numero' => fake()->unique()->numberBetween(1, 9999),
            'titulo' => fake()->sentence(3),
            'letra'  => fake()->paragraphs(3, true),
            'autor'  => fake()->name(),
            'tom'    => fake()->randomElement(['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Am', 'Em', 'Dm']),
            'tags'   => null,
            'ativo'  => true,
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (Musica $musica) {
            $musica->temas()->attach(Tema::factory()->create());
        });
    }

    public function inativo(): static
    {
        return $this->state(fn () => [
            'ativo' => false,
        ]);
    }
}
