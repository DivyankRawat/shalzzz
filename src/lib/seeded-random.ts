/**
 * mulberry32 — a small seeded PRNG.
 *
 * Scattered decoration has to land in the same place on the server and on the
 * client, or React throws away the markup it just streamed. A seed makes the
 * layout look random but stay identical on every render.
 */
export function seededRandom(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
