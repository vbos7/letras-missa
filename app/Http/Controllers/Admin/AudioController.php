<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Musica;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AudioController extends Controller
{
    private function findBinary(string $name): ?string
    {
        $candidates = [
            "/Library/Frameworks/Python.framework/Versions/3.13/bin/{$name}",
            "/opt/homebrew/bin/{$name}",
            "/usr/local/bin/{$name}",
            "/usr/bin/{$name}",
        ];

        foreach ($candidates as $path) {
            if (file_exists($path)) {
                return $path;
            }
        }

        $which = trim(shell_exec("which {$name} 2>/dev/null") ?? '');

        return $which ?: null;
    }

    public function index()
    {
        $musicas = Musica::orderBy('numero')->get()->map(fn ($m) => [
            'id'        => $m->id,
            'numero'    => $m->numero,
            'titulo'    => $m->titulo,
            'has_audio' => file_exists(public_path("audio/{$m->id}.mp3")),
        ]);

        return Inertia::render('admin/audio/index', [
            'musicas'         => $musicas,
            'ytdlpInstalled'  => $this->findBinary('yt-dlp') !== null,
            'ffmpegInstalled' => $this->findBinary('ffmpeg') !== null,
        ]);
    }

    public function download(Request $request, Musica $musica)
    {
        $request->validate([
            'youtube_url' => [
                'required',
                'url',
                'regex:/^https?:\/\/(www\.)?(youtube\.com\/watch\?.*v=|youtu\.be\/)[a-zA-Z0-9_\-]+/',
            ],
        ]);

        $ytdlp  = $this->findBinary('yt-dlp');
        $ffmpeg = $this->findBinary('ffmpeg');

        if (!$ytdlp || !$ffmpeg) {
            return back()->with('error', 'yt-dlp ou ffmpeg não encontrado. Instale as dependências primeiro.');
        }

        $outputPath  = public_path("audio/{$musica->id}.mp3");
        $cookiesFile = '/var/www/yt-cookies/youtube-cookies.txt';
        $cookiesFlag = file_exists($cookiesFile)
            ? '--cookies ' . escapeshellarg($cookiesFile)
            : '';

        $command = sprintf(
            '%s --ffmpeg-location %s --extract-audio --audio-format mp3 --audio-quality 128K --no-playlist --no-warnings %s --output %s -- %s 2>&1',
            escapeshellarg($ytdlp),
            escapeshellarg($ffmpeg),
            $cookiesFlag,
            escapeshellarg($outputPath),
            escapeshellarg($request->input('youtube_url'))
        );

        set_time_limit(120);

        $output = [];
        $code   = null;
        exec($command, $output, $code);

        if ($code !== 0 || !file_exists($outputPath)) {
            return back()->with('error', 'Falha ao baixar: ' . implode(' | ', array_filter($output)));
        }

        return back()->with('success', "Áudio #{$musica->numero} {$musica->titulo} baixado com sucesso.");
    }

    public function destroy(Musica $musica)
    {
        $path = public_path("audio/{$musica->id}.mp3");

        if (!file_exists($path)) {
            return back()->with('error', 'Arquivo de áudio não encontrado.');
        }

        unlink($path);

        return back()->with('success', "Áudio #{$musica->numero} {$musica->titulo} excluído.");
    }
}
