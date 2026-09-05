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

        // Instalações via "pip install --user" ficam em ~/Library/Python/X.Y/bin
        $home = $_SERVER['HOME'] ?? getenv('HOME') ?: '/root';
        foreach (glob($home . '/Library/Python/*/bin/' . $name) ?: [] as $path) {
            $candidates[] = $path;
        }

        foreach ($candidates as $path) {
            if (file_exists($path)) {
                return $path;
            }
        }

        $which = trim(shell_exec("which {$name} 2>/dev/null") ?? '');

        return $which ?: null;
    }

    public function index(Request $request)
    {
        // Números das músicas que possuem arquivo de áudio (a partir do disco).
        // O arquivo é nomeado pelo número da música (ex.: audio/123.mp3).
        $numerosComAudio = [];
        foreach (glob(public_path('audio') . '/*.mp3') ?: [] as $file) {
            $numero = (int) pathinfo($file, PATHINFO_FILENAME);
            if ($numero > 0) {
                $numerosComAudio[] = $numero;
            }
        }

        $query = Musica::query()->orderBy('numero');

        if ($request->filled('search')) {
            $query->search($request->search);
        }

        if ($request->status === 'com') {
            $query->whereIn('numero', $numerosComAudio);
        } elseif ($request->status === 'sem') {
            $query->whereNotIn('numero', $numerosComAudio);
        }

        $musicas = $query->paginate(20)->withQueryString()->through(fn ($m) => [
            'id'        => $m->id,
            'numero'    => $m->numero,
            'titulo'    => $m->titulo,
            'autor'     => $m->autor,
            'has_audio' => in_array($m->numero, $numerosComAudio, true),
        ]);

        return Inertia::render('admin/audio/index', [
            'musicas' => $musicas,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status ?? '',
            ],
            'stats' => [
                'total'     => Musica::count(),
                'com_audio' => Musica::whereIn('numero', $numerosComAudio)->count(),
            ],
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

        $outputPath  = public_path("audio/{$musica->numero}.mp3");
        $cookiesFile = '/var/www/yt-cookies/youtube-cookies.txt';
        $cookiesFlag = file_exists($cookiesFile)
            ? '--cookies ' . escapeshellarg($cookiesFile)
            : '';

        $command = sprintf(
            '%s --ffmpeg-location %s --extractor-args "youtube:player_client=android,web" -f bestaudio/best --extract-audio --audio-format mp3 --audio-quality 5 --no-playlist --no-warnings %s --output %s -- %s 2>&1',
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
        $path = public_path("audio/{$musica->numero}.mp3");

        if (!file_exists($path)) {
            return back()->with('error', 'Arquivo de áudio não encontrado.');
        }

        unlink($path);

        return back()->with('success', "Áudio #{$musica->numero} {$musica->titulo} excluído.");
    }
}
