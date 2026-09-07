<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AudioInfo extends Model
{
    protected $fillable = [
        'musica_id',
        'artista',
        'compositor',
        'album',
        'gravadora',
        'distribuidora',
        'data_lancamento',
        'fonte_url',
        'descricao',
    ];

    public function musica(): BelongsTo
    {
        return $this->belongsTo(Musica::class);
    }
}
