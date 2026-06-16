/** Fisher–Yates shuffle (same approach as InfiniteImageScroll hero carousel). */
export function shuffleInPlace<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function pickRandomItems<T>(items: readonly T[], count: number): T[] {
  const copy = [...items];
  if (copy.length <= count) return shuffleInPlace(copy);
  shuffleInPlace(copy);
  return copy.slice(0, count);
}
