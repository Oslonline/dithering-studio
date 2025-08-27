// Floyd–Steinberg dithering (returns monochrome RGBA buffer)

interface Params {
	data: Uint8ClampedArray;
	width: number;
	height: number;
	threshold: number;
	invert: boolean;
	serpentine: boolean;
}

const floydSteinberg = ({ data, width, height, threshold, invert, serpentine }: Params): Uint8ClampedArray => {
	const out = new Uint8ClampedArray(data.length);
	const lum = new Float32Array(width * height);
	for (let i = 0, p = 0; i < data.length; i += 4, p++) {
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];
		lum[p] = 0.299 * r + 0.587 * g + 0.114 * b;
	}

	const white = invert ? 0 : 255;
	const black = invert ? 255 : 0;

	for (let y = 0; y < height; y++) {
		const serp = serpentine && (y & 1) === 1;
		if (!serp) {
			for (let x = 0; x < width; x++) {
				const idx = y * width + x;
				const oldVal = lum[idx];
				const newVal = oldVal < threshold ? black : white;
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
				const newVal = oldVal < threshold ? black : white;
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

	return out;
};

export default floydSteinberg;
