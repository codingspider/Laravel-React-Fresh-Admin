<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class OcrController extends Controller
{
    public function index()
    {
        return view('upload');
    }

    public function extract(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:5120',
        ]);

        $path = $request->file('image')->store('menus', 'public');
        $fullPath = storage_path("app/public/" . $path);

        $response = Http::attach(
            'file',
            file_get_contents($fullPath),
            'menu.png'
        )->post('https://api.ocr.space/parse/image', [
            'apikey' => config('services.ocr.api_key', ''),
            'language' => 'eng',
            'isOverlayRequired' => false,
        ]);

        $result = $response->json();

        $text = $result['ParsedResults'][0]['ParsedText'] ?? '';

        return response()->json([
            'success' => true,
            'text' => $text,
        ]);
    }
}