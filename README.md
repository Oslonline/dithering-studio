<div align="center">
  <img src="https://i.imgur.com/sauiEx8.png" alt="preview" />
  <h1>Dithering Studio</h1>
  <p><strong>Fast, private, client‑side dithering for images and video — with classic + experimental algorithms, palettes, presets, and an interactive explorer.</strong></p>
</div>

## Live app

Use it in your browser: https://ditheringstudio.com/

No uploads, no account. Everything runs locally in the tab.

## Highlights

- 25+ algorithms: error diffusion, ordered matrices, stochastic, adaptive, ASCII.
- Image and video modes. Export frames (PNG/JPEG/WEBP/SVG) or full videos (WebM/MP4\*).
- Built‑in palettes (Game Boy, PICO‑8, DB16/32, CGA/EGA, etc.) with live swatch toggling.
- Presets you can save, rename, import/export as tokens, and re‑apply.
- Shareable URLs for algorithm/threshold/resolution/palette/serpentine/invert/ASCII ramp.
- Keyboard shortcuts and grid overlay for precise inspection.

\*MP4 availability depends on your browser/OS codecs; WebM is widely supported. WEBP export falls back to PNG if unsupported.

## Quick start (local)

```powershell
git clone https://github.com/Oslonline/dithering-studio.git
cd dithering-studio
npm install
npm run dev
```

Open the local URL printed in the terminal, drop an image or select a video, tweak settings, and export.

## How to use

1. Load media

- Images: drag & drop one or more files.
- Video: switch to Video Mode and pick a file; scrub/play to preview.

2. Choose an algorithm

- Error diffusion (Floyd–Steinberg family, Sierra/Stucki/JJN, Ostromoukhov, adaptive FS) or ordered/stochastic (Bayer 2×2…32×32, Blue Noise), or experimental (dot diffusion, halftone, random threshold, ASCII mosaic).

3. Tune controls

- Threshold, resolution, serpentine traversal (diffusion), invert.
- Palette: apply built‑ins or custom colors.

4. Presets

- Save the current setup as a preset. Rename, delete, export/import via tokens.

5. Export

- Frames: PNG, JPEG, WEBP; plus SVG vector (images only). You can also copy the frame to clipboard.
- Video: record and download as WebM or MP4\* directly from the browser.

## Algorithms

Error Diffusion

- Floyd–Steinberg • False Floyd–Steinberg • Atkinson • Sierra Lite • Burkes • Stucki • Sierra • Jarvis–Judice–Ninke • Two‑Row Sierra • Stevenson–Arce • Ostromoukhov (adaptive) • Adaptive FS 3×3 • Adaptive FS 7×7 • Sierra 2‑4A

Ordered / Stochastic

- Bayer 2×2 • Bayer 4×4 • Bayer 8×8 • Bayer 16×16 • Bayer 32×32 • Blue Noise 64×64

Other / Experimental

- Binary Threshold • Halftone • Random Threshold • Dot Diffusion (Simple) • ASCII Mosaic

Explore details and live examples in the app’s Algorithm Explorer: `/Education/Algorithms` (deep‑link with `?algo=<id>`).

## Palettes included

- Game Boy (4) • NES (approx 54) • PICO‑8 (16) • DawnBringer 16/32 • CGA (16) • EGA (16) • Solarized (16) • Grayscale (4/8) • C64 subset • Web Safe (16)

## Keyboard shortcuts

- F: toggle Focus Mode (hide UI chrome)
- G: toggle pixel grid • Shift+G: cycle grid size
- ←/→: cycle images (when multiple are loaded)

## Privacy

Everything happens in your browser. Media never leaves your machine. No accounts.

## Development

- Scripts: `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`
- Stack: React • TypeScript • Vite • Tailwind • Canvas API

## Contributing

Small, focused PRs are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[Apache-2.0](./LICENSE). See [NOTICE](./NOTICE) for attribution guidance.

## Credits

Built by [Oslo418](https://oslo418.com). Inspired by tools like Dither It and Dither Boy — combined with multi‑algorithm exploration, fast iteration, and palette/threshold tweaking in one place. From a sideproject to a fully functionnal tool !
