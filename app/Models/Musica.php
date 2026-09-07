<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\DB;

class Musica extends Model
{
    use HasFactory;

    protected $fillable = [
        'numero',
        'titulo',
        'letra',
        'autor',
        'tom',
        'tags',
        'ativo',
    ];

    protected $casts = [
        'ativo' => 'boolean',
    ];

    public function temas(): BelongsToMany
    {
        return $this->belongsToMany(Tema::class, 'musica_tema')->withTimestamps();
    }

    public function audioInfo(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(AudioInfo::class);
    }

    public function listas(): BelongsToMany
    {
        return $this->belongsToMany(Lista::class, 'lista_musicas')
            ->withPivot('ordem', 'observacao')
            ->withTimestamps()
            ->orderBy('ordem');
    }

    // Scope para busca. Ignora acentuação (COLLATE utf8mb4_general_ci no MySQL)
    // e pontuação: a busca é quebrada em palavras (separadas por espaços ou
    // pontuação) e cada palavra precisa aparecer em algum dos campos. Assim
    // "Senhor que vieste salvar" encontra "Senhor, que vieste salvar...".
    public function scopeSearch($query, $search)
    {
        $isMySQL = DB::connection()->getDriverName() === 'mysql';

        // Quebra a busca em palavras, descartando pontuação e espaços extras.
        $palavras = preg_split('/[^\p{L}\p{N}]+/u', (string) $search, -1, PREG_SPLIT_NO_EMPTY);

        if (empty($palavras)) {
            return $query;
        }

        return $query->where(function ($q) use ($palavras, $isMySQL) {
            foreach ($palavras as $palavra) {
                $term = "%{$palavra}%";
                $q->where(function ($sub) use ($term, $isMySQL) {
                    if ($isMySQL) {
                        $sub->whereRaw('numero LIKE ?', [$term])
                            ->orWhereRaw('titulo COLLATE utf8mb4_general_ci LIKE ?', [$term])
                            ->orWhereRaw('autor COLLATE utf8mb4_general_ci LIKE ?', [$term])
                            ->orWhereRaw('letra COLLATE utf8mb4_general_ci LIKE ?', [$term]);
                    } else {
                        $sub->where('numero', 'like', $term)
                            ->orWhere('titulo', 'like', $term)
                            ->orWhere('autor', 'like', $term)
                            ->orWhere('letra', 'like', $term);
                    }
                });
            }
        });
    }

    // Scope para filtrar por tema
    public function scopeByTema($query, $temaId)
    {
        return $query->whereHas('temas', fn ($q) => $q->where('temas.id', $temaId));
    }
}
