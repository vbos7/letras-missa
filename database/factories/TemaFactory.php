<?php

namespace Database\Factories;

use App\Models\Tema;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Tema>
 */
class TemaFactory extends Factory
{
    protected $model = Tema::class;

    public function definition(): array
    {
        $nome = fake()->unique()->word();

        return [
            'nome'  => ucfirst($nome),
            'slug'  => Str::slug($nome),
            'cor'   => fake()->hexColor(),
            'ordem' => fake()->unique()->numberBetween(1, 100),
        ];
    }
}
