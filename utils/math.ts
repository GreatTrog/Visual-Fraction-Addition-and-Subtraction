import { Fraction } from '../types';

export const gcd = (a: number, b: number): number => {
  return b === 0 ? a : gcd(b, a % b);
};

export const lcm = (a: number, b: number): number => {
  return (a * b) / gcd(a, b);
};

export const getRandomFraction = (minDenom: number, maxDenom: number): Fraction => {
  const d = Math.floor(Math.random() * (maxDenom - minDenom + 1)) + minDenom;
  // Numerator should be less than denominator, and at least 1.
  // We also want to avoid extremely simple cases sometimes, but simple is good for visualization.
  const n = Math.floor(Math.random() * (d - 1)) + 1;
  return { n, d };
};