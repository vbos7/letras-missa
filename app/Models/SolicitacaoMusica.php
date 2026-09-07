<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SolicitacaoMusica extends Model
{
    protected $table = 'solicitacoes_musicas';

    protected $fillable = [
        'user_id',
        'musica_id',
        'tipo',
        'dados',
        'status',
        'nota_admin',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'dados'       => 'array',
        'reviewed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function musica(): BelongsTo
    {
        return $this->belongsTo(Musica::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function isPendente(): bool
    {
        return $this->status === 'pendente';
    }
}
