<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, BelongsToMany};
use Illuminate\Support\Str;

class Lista extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nome',
        'token',
        'publica',
        'visualizacoes',
    ];

    protected $casts = [
        'publica' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($lista) {
            if (empty($lista->token)) {
                $lista->token = Str::random(32);
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function musicas(): BelongsToMany
    {
        return $this->belongsToMany(Musica::class, 'lista_musicas')
            ->withPivot('ordem', 'observacao')
            ->withTimestamps()
            ->orderBy('ordem');
    }

    // Gera URL para compartilhamento
    public function getShareUrlAttribute(): string
    {
        return route('listas.compartilhada', $this->token);
    }

    // Incrementa visualizações
    public function incrementarVisualizacoes(): void
    {
        $this->increment('visualizacoes');
    }
}
