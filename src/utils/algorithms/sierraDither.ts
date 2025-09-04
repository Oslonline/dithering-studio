import { createErrorDiffusionKernelRunner } from './errorDiffusionKernels';
// Sierra 2-4A (popular variant) kernel weights (normalized divisor 32)
// Reference pattern: 
//       .  4  5  4
//    2  4  5  4  2
//       2  3  2
// We adapt to forward distribution kernel layout used in helper (center horizontally).
const kernel = [
    [0, 0, 4, 5, 4],
    [2, 4, 5, 4, 2],
    [0, 2, 3, 2, 0],
];
// Divisor sum = 37 (original). We'll normalize using actual sum to preserve energy.
const divisor = kernel.reduce((s, row) => s + row.reduce((a, b) => a + b, 0), 0); // 37
export const runSierra24A = createErrorDiffusionKernelRunner(kernel, divisor, true);
export default runSierra24A;
