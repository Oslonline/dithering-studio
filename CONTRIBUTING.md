## Contributing

Thanks for your interest! The goal is to keep the code approachable and the UI fast.

### Requirements
* Node.js 20.19+ (Vite 7 will warn if older)

### Setup
```bash
git clone https://github.com/Oslonline/steinberg-image.git
cd steinberg-image
npm install
npm run dev
```

### Branch & Commits
* Branch: `feat/short-topic`, `fix/issue-123`, `docs/readme`
* Conventional-ish prefixes (`feat:`, `fix:`, `refactor:`, `docs:`) encouraged.

### Scripts
| Command | What |
| ------- | ---- |
| npm run dev | Dev server |
| npm run build | Type-check + production build |
| npm run preview | Preview dist |
| npm run lint | ESLint |

### Add a New Algorithm
1. Implement logic (extend `PatternDrawer` or new util). Keep pure; input raw RGBA.
2. Register metadata in `src/utils/algorithmInfo.ts` (unique `id`).
3. If user-selectable: update `patternMeta` in `PatternDrawer` export.
4. Make sure it handle settings like invert or serpentine if not disable them following our existing logic for it.
5. Confirm explorer page renders new example.
6. Provide: overview, 2–3 characteristics, artifacts, usage, kernel/matrix if applicable.

### Palettes
Edit `src/utils/palettes.ts`. Keep palette lists historically accurate & concise.

### Style
* Tailwind ordering handled by Prettier plugin
* Prefer descriptive names over long comments
* Avoid heavy dependencies; keep client-only

### Performance
* Reuse buffers where possible
* Typed arrays for math (already used)
* Test large widths (~2000px) before PR if performance related

### PR Checklist
* [ ] `npm run lint` passes
* [ ] `npm run build` succeeds
* [ ] Explorer loads (no runtime errors)
* [ ] Metadata updated for new/changed algorithms
* [ ] Docs adjusted if behavior changed

### Issues
Provide reproduction steps, browser + OS, and (if visual) a small screenshot.

### Security / Privacy
Images never leave browser. If any external leak/regression is found, open issue with `security` label.

### License
MIT – contributions licensed under same.

Thanks!
