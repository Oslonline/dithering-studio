
interface Params { data: Uint8ClampedArray; width: number; height: number; threshold: number; invert: boolean; serpentine: boolean; palette?: [number, number, number][]; }

const floydSteinberg = ({ data, width, height, threshold, invert, serpentine, palette }: Params): Uint8ClampedArray => {
	const out = new Uint8ClampedArray(data.length);

	// Palette-aware diffusion branch
		if (palette) {
		const work = new Float32Array(data.length);
		for (let i = 0; i < data.length; i++) work[i] = data[i];
		const bias = ((threshold - 128) / 255) * 64;
		for (let y = 0; y < height; y++) {
			const serp = serpentine && (y & 1) === 1;
			if (!serp) {
				for (let x = 0; x < width; x++) {
					const base = (y * width + x) * 4;
						let r = work[base];
						let g = work[base + 1];
						let b = work[base + 2];
						if (invert) { r = 255 - r; g = 255 - g; b = 255 - b; }
					r = Math.max(0, Math.min(255, r + bias));
					g = Math.max(0, Math.min(255, g + bias));
					b = Math.max(0, Math.min(255, b + bias));
					let best = 0; let bestDist = Infinity;
					for (let i = 0; i < palette.length; i++) {
						const pr = palette[i][0], pg = palette[i][1], pb = palette[i][2];
						const dr = r - pr, dg = g - pg, db = b - pb;
						const d = dr * dr + dg * dg + db * db;
						if (d < bestDist) { bestDist = d; best = i; }
					}
					const nr = palette[best][0]; const ng = palette[best][1]; const nb = palette[best][2];
					const er = r - nr, eg = g - ng, eb = b - nb;
					work[base] = nr; work[base + 1] = ng; work[base + 2] = nb; work[base + 3] = 255;
					if (x + 1 < width) { const i = base + 4; work[i] += (er * 7) / 16; work[i + 1] += (eg * 7) / 16; work[i + 2] += (eb * 7) / 16; }
					if (y + 1 < height) {
						if (x > 0) { const i = base + width * 4 - 4; work[i] += (er * 3) / 16; work[i + 1] += (eg * 3) / 16; work[i + 2] += (eb * 3) / 16; }
						{ const i = base + width * 4; work[i] += (er * 5) / 16; work[i + 1] += (eg * 5) / 16; work[i + 2] += (eb * 5) / 16; }
						if (x + 1 < width) { const i = base + width * 4 + 4; work[i] += (er * 1) / 16; work[i + 1] += (eg * 1) / 16; work[i + 2] += (eb * 1) / 16; }
					}
				}
			} else {
				for (let x = width - 1; x >= 0; x--) {
					const base = (y * width + x) * 4;
					let r = work[base]; let g = work[base + 1]; let b = work[base + 2];
					if (invert) { r = 255 - r; g = 255 - g; b = 255 - b; }
						r = Math.max(0, Math.min(255, r + bias));
						g = Math.max(0, Math.min(255, g + bias));
						b = Math.max(0, Math.min(255, b + bias));
						let best = 0; let bestDist = Infinity;
						for (let i = 0; i < palette.length; i++) {
							const pr = palette[i][0], pg = palette[i][1], pb = palette[i][2];
							const dr = r - pr, dg = g - pg, db = b - pb;
							const d = dr * dr + dg * dg + db * db;
							if (d < bestDist) { bestDist = d; best = i; }
						}
						const nr = palette[best][0]; const ng = palette[best][1]; const nb = palette[best][2];
						const er = r - nr, eg = g - ng, eb = b - nb;
						work[base] = nr; work[base + 1] = ng; work[base + 2] = nb; work[base + 3] = 255;
						if (x - 1 >= 0) { const i = base - 4; work[i] += (er * 7) / 16; work[i + 1] += (eg * 7) / 16; work[i + 2] += (eb * 7) / 16; }
						if (y + 1 < height) {
							if (x + 1 < width) { const i = base + width * 4 + 4; work[i] += (er * 3) / 16; work[i + 1] += (eg * 3) / 16; work[i + 2] += (eb * 3) / 16; }
							{ const i = base + width * 4; work[i] += (er * 5) / 16; work[i + 1] += (eg * 5) / 16; work[i + 2] += (eb * 5) / 16; }
							if (x - 1 >= 0) { const i = base + width * 4 - 4; work[i] += (er * 1) / 16; work[i + 1] += (eg * 1) / 16; work[i + 2] += (eb * 1) / 16; }
						}
				}
			}
		}
		for (let i = 0; i < data.length; i++) out[i] = work[i];
		// Inversion is disabled in UI when palette present, but keep defensively.
		return out as Uint8ClampedArray;
	}

	// Grayscale FS diffusion branch
	const lum = new Float32Array(width * height);
	for (let i = 0, p = 0; i < data.length; i += 4, p++) {
		const r = data[i], g = data[i + 1], b = data[i + 2];
		lum[p] = 0.299 * r + 0.587 * g + 0.114 * b;
	}

	for (let y = 0; y < height; y++) {
		const serp = serpentine && (y & 1) === 1;
		if (!serp) {
			for (let x = 0; x < width; x++) {
				const idx = y * width + x;
				const oldVal = lum[idx];
				const newVal = oldVal < threshold ? 0 : 255;
				const err = oldVal - newVal;
				lum[idx] = newVal;
				if (x + 1 < width) lum[idx + 1] += (err * 7) / 16;
				if (y + 1 < height) {
					if (x > 0) lum[idx + width - 1] += (err * 3) / 16;
					lum[idx + width] += (err * 5) / 16;
					if (x + 1 < width) lum[idx + width + 1] += (err * 1) / 16;
				}
			}
		} else {
			for (let x = width - 1; x >= 0; x--) {
				const idx = y * width + x;
				const oldVal = lum[idx];
				const newVal = oldVal < threshold ? 0 : 255;
				const err = oldVal - newVal;
				lum[idx] = newVal;
				if (x - 1 >= 0) lum[idx - 1] += (err * 7) / 16;
				if (y + 1 < height) {
					if (x + 1 < width) lum[idx + width + 1] += (err * 3) / 16;
					lum[idx + width] += (err * 5) / 16;
					if (x - 1 >= 0) lum[idx + width - 1] += (err * 1) / 16;
				}
			}
		}
	}

	for (let p = 0, i = 0; p < lum.length; p++, i += 4) {
		const v = Math.max(0, Math.min(255, lum[p]));
		out[i] = out[i + 1] = out[i + 2] = v;
		out[i + 3] = 255;
	}
		if (invert) { for (let i = 0; i < out.length; i += 4) { out[i] = 255 - out[i]; out[i + 1] = 255 - out[i + 1]; out[i + 2] = 255 - out[i + 2]; } }
	return out;
};

export default floydSteinberg;
