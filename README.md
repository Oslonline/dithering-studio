<div align="center">
  <img src="https://i.imgur.com/sauiEx8.png" alt="preview" />
  <h1>Dithering Studio</h1>
  <p><strong>Fast, private, client‑side dithering for images and video — with classic + experimental algorithms, palettes, presets, and an interactive explorer.</strong></p>
</div>

## Live app

Use it in your browser: https://ditheringstudio.com/

No uploads, no account. Everything runs locally in the tab.

## Highlights

- 30 algorithms: error diffusion, ordered matrices, stochastic, adaptive, ASCII.
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

## Algorithms (30+ supported)

Every algorithm runs in the live app at [ditheringstudio.com](https://ditheringstudio.com). Use the links below to open the interactive tool or read the technical reference page.

### Error diffusion

| Algorithm | Try live | Reference |
| --- | --- | --- |
| Floyd–Steinberg | [Try Floyd–Steinberg Live](https://ditheringstudio.com/en/Dithering/Image?p=1) | [Algorithm details](https://ditheringstudio.com/en/Education/Algorithms/floyd-steinberg) |
| False Floyd–Steinberg | [Try False Floyd–Steinberg Live](https://ditheringstudio.com/en/Dithering/Image?p=19) | [Algorithm details](https://ditheringstudio.com/en/Education/Algorithms/false-floyd-steinberg) |
| Atkinson | [Try Atkinson Live](https://ditheringstudio.com/en/Dithering/Image?p=3) | [Algorithm details](https://ditheringstudio.com/en/Education/Algorithms/atkinson) |
| Sierra Lite | [Try Sierra Lite Live](https://ditheringstudio.com/en/Dithering/Image?p=12) | [Algorithm details](https://ditheringstudio.com/en/Education/Algorithms/sierra-lite) |
| Burkes | [Try Burkes Live](https://ditheringstudio.com/en/Dithering/Image?p=4) | [Algorithm details](https://ditheringstudio.com/en/Education/Algorithms/burkes) |
| Stucki | [Try Stucki Live](https://ditheringstudio.com/en/Dithering/Image?p=5) | [Algorithm details](https://ditheringstudio.com/en/Education/Algorithms/stucki) |
| Sierra | [Try Sierra Live](https://ditheringstudio.com/en/Dithering/Image?p=6) | [Algorithm details](https://ditheringstudio.com/en/Education/Algorithms/sierra) |
| Jarvis–Judice–Ninke | [Try JJN Live](https://ditheringstudio.com/en/Dithering/Image?p=7) | [Algorithm details](https://ditheringstudio.com/en/Education/Algorithms/jarvis-judice-ninke) |
| Two-Row Sierra | [Try Two-Row Sierra Live](https://ditheringstudio.com/en/Dithering/Image?p=13) | [Algorithm details](https://ditheringstudio.com/en/Education/Algorithms/two-row-sierra) |
| Stevenson–Arce | [Try Stevenson–Arce Live](https://ditheringstudio.com/en/Dithering/Image?p=14) | [Algorithm details](https://ditheringstudio.com/en/Education/Algorithms/stevenson-arce) |
| Ostromoukhov | [Try Ostromoukhov Live](https://ditheringstudio.com/en/Dithering/Image?p=18) | [Algorithm details](https://ditheringstudio.com/en/Education/Algorithms/ostromoukhov) |
| Adaptive FS 3×3 | [Try Adaptive FS 3×3 Live](https://ditheringstudio.com/en/Dithering/Image?p=21) | [Algorithm details](https://ditheringstudio.com/en/Education/Algorithms/adaptive-fs-3x3) |
| Adaptive FS 7×7 | [Try Adaptive FS 7×7 Live](https://ditheringstudio.com/en/Dithering/Image?p=22) | [Algorithm details](https://ditheringstudio.com/en/Education/Algorithms/adaptive-fs-7x7) |
| Sierra 2-4A | [Try Sierra 2-4A Live](https://ditheringstudio.com/en/Dithering/Image?p=23) | [Algorithm details](https://ditheringstudio.com/en/Education/Algorithms/sierra-2-4a) |
| Custom Kernel | [Try Custom Kernel Live](https://ditheringstudio.com/en/Dithering/Image?p=26) | [Algorithm details](https://ditheringstudio.com/en/Education/Algorithms/custom-kernel) |
| Riemersma | [Try Riemersma Live](https://ditheringstudio.com/en/Dithering/Image?p=27) | [Algorithm details](https://ditheringstudio.com/en/Education/Algorithms/riemersma) |

### Ordered / stochastic

| Algorithm | Try live | Reference |
| --- | --- | --- |
| Bayer 2×2 | [Try Bayer 2×2 Live](https://ditheringstudio.com/en/Dithering/Image?p=16) | [Algorithm details](https://ditheringstudio.com/en/Education/Algorithms/bayer-2x2) |
| Bayer 4×4 | [Try Bayer 4×4 Live](https://ditheringstudio.com/en/Dithering/Image?p=2) | [Algorithm details](https://ditheringstudio.com/en/Education/Algorithms/bayer-4x4) |
| Bayer 8×8 | [Try Bayer 8×8 Live](https://ditheringstudio.com/en/Dithering/Image?p=8) | [Algorithm details](https://ditheringstudio.com/en/Education/Algorithms/bayer-8x8) |
| Bayer 16×16 | [Try Bayer 16×16 Live](https://ditheringstudio.com/en/Dithering/Image?p=20) | [Algorithm details](https://ditheringstudio.com/en/Education/Algorithms/bayer-16x16) |
| Bayer 32×32 | [Try Bayer 32×32 Live](https://ditheringstudio.com/en/Dithering/Image?p=24) | [Algorithm details](https://ditheringstudio.com/en/Education/Algorithms/bayer-32x32) |
| Blue Noise 64×64 | [Try Blue Noise 64×64 Live](https://ditheringstudio.com/en/Dithering/Image?p=17) | [Algorithm details](https://ditheringstudio.com/en/Education/Algorithms/blue-noise-64x64) |

### Other / experimental

| Algorithm | Try live | Reference |
| --- | --- | --- |
| Binary Threshold | [Try Binary Threshold Live](https://ditheringstudio.com/en/Dithering/Image?p=15) | [Algorithm details](https://ditheringstudio.com/en/Education/Algorithms/binary-threshold) |
| Halftone | [Try Halftone Live](https://ditheringstudio.com/en/Dithering/Image?p=9) | [Algorithm details](https://ditheringstudio.com/en/Education/Algorithms/halftone) |
| Random Threshold | [Try Random Threshold Live](https://ditheringstudio.com/en/Dithering/Image?p=10) | [Algorithm details](https://ditheringstudio.com/en/Education/Algorithms/random-threshold) |
| Dot Diffusion (Simple) | [Try Dot Diffusion Live](https://ditheringstudio.com/en/Dithering/Image?p=11) | [Algorithm details](https://ditheringstudio.com/en/Education/Algorithms/dot-diffusion-simple) |
| ASCII Mosaic | [Try ASCII Mosaic Live](https://ditheringstudio.com/en/Dithering/Image?p=25) | [Algorithm details](https://ditheringstudio.com/en/Education/Algorithms/ascii-mosaic) |
| Posterize | [Try Posterize Live](https://ditheringstudio.com/en/Dithering/Image?p=28) | [Algorithm details](https://ditheringstudio.com/en/Education/Algorithms/posterize) |
| Woodcut | [Try Woodcut Live](https://ditheringstudio.com/en/Dithering/Image?p=29) | [Algorithm details](https://ditheringstudio.com/en/Education/Algorithms/woodcut) |
| Stipple | [Try Stipple Live](https://ditheringstudio.com/en/Dithering/Image?p=30) | [Algorithm details](https://ditheringstudio.com/en/Education/Algorithms/stipple) |

Video dithering (MP4/WebM, frame-by-frame, client-side): [Open Video Mode](https://ditheringstudio.com/en/Dithering/Video)

Browse the full interactive explorer: [Education / Algorithms](https://ditheringstudio.com/en/Education/Algorithms)

## Palettes included

- Game Boy (4) • NES (approx 54) • PICO‑8 (16) • DawnBringer 16/32 • CGA (16) • EGA (16) • Solarized (16) • Grayscale (4/8) • C64 subset • Web Safe (16)

## Keyboard shortcuts

- F: toggle Focus Mode (hide UI chrome)
- G: toggle pixel grid • Shift+G: cycle grid size
- ←/→: cycle images (when multiple are loaded)

## Privacy

Core dithering stays browser-only: media processing runs locally and source files are not uploaded by default.
Optional account/gallery features (when enabled) use Supabase and only store data you explicitly submit.

## Development

- Scripts: `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`
- Stack: Next.js • React • TypeScript • Tailwind • Canvas API

### Optional account setup (Supabase)

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_ENABLE_ACCOUNTS=true`

## Contributing

Small, focused PRs are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md).

## V2 planning docs

V2 planning and research documents live in [`docs/v2`](./docs/v2/README.md).

## License

[Apache-2.0](./LICENSE). See [NOTICE](./NOTICE) for attribution guidance.

## Credits

Built by [Oslo418](https://x.com/Oslo418). Inspired by tools like Dither It and Dither Boy — combined with multi‑algorithm exploration, fast iteration, and palette/threshold tweaking in one place. From a sideproject to a fully functional tool!
