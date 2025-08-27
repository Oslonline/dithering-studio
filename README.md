<div align="center">
  <h1>Steinberg Image Dithering Studio</h1>
  <p><strong>Fast, client‑side image dithering with classic + experimental algorithms, palettes & an interactive explorer.</strong></p>
</div>

## What it does
Turn any image into a retro / stylized dithered version directly in your browser. No upload. Just drop, tweak, download.

## Available Algorithms
Error Diffusion:
Floyd–Steinberg · Atkinson · Burkes · Stucki · Sierra · Sierra Lite · Two‑Row Sierra · Stevenson–Arce · Jarvis–Judice–Ninke

Ordered / Masks:
Bayer 2×2 · Bayer 4×4 · Bayer 8×8 · Blue Noise Mask (64×64)

Other / Experimental:
Binary Threshold · Halftone · Random Threshold · Dot Diffusion (simple)

## Palettes Included
Game Boy · NES · PICO‑8 · DawnBringer 16 / 32 · CGA 16 · EGA 16 · Solarized 16 · Grayscale (4 / 8) · C64 subset · Web Safe 16

Palette mode remaps colors before / during diffusion (depending on algorithm) for authentic limited‑color looks.

## Try It Locally (optional)
Requires Node 20.19+ (recent LTS works). If you only want to use it, visit the deployed site (see repo description). To hack on it:

```bash
git clone https://github.com/Oslonline/steinberg-image.git
cd steinberg-image
npm install
npm run dev
```

Open the shown local URL. Drop an image. Pick an algorithm. Adjust threshold / resolution / palette / invert (when allowed). Download.

## Dev Scripts (for contributors)
dev · build · preview · lint (standard Vite workflow)

## Add an Algorithm (for contributors)
Add logic, register metadata, verify example appears, update readme list. See CONTRIBUTING for a quick checklist.

## Contribute
Small focused PRs welcome. Guidelines: [CONTRIBUTING.md](./CONTRIBUTING.md)

## License
[MIT](./LICENSE)

## Stack
React · TypeScript · Vite · Tailwind · Canvas API

---
If you like it, star the repo or share a dithered image. ✦
