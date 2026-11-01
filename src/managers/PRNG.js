/**
 * PRNG (Pseudo-Random Number Generator)
 * Mulberry32 32-bit PRNG for deterministic daily challenge fixed-seed obstacle generation.
 */

export class PRNG {
  constructor(seed) {
    this.seed = typeof seed === 'number' ? seed : this.hashString(seed.toString());
    this.state = this.seed >>> 0;
  }

  hashString(str) {
    let hash = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      hash = Math.imul(hash ^ str.charCodeAt(i), 3432918353);
      hash = (hash << 13) | (hash >>> 19);
    }
    return hash >>> 0;
  }

  /**
   * Returns a float in [0, 1)
   */
  next() {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  between(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  floatBetween(min, max) {
    return this.next() * (max - min) + min;
  }

  pick(array) {
    if (!array || array.length === 0) return null;
    const index = Math.floor(this.next() * array.length);
    return array[index];
  }
}
