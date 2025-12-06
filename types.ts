export interface Fraction {
  n: number;
  d: number;
}

export interface FractionModelProps {
  fraction1: Fraction;
  fraction2: Fraction;
  step: number;
  commonDenominator: number;
  mode: 'add' | 'subtract';
}

export interface BlockPosition {
  x: number; // percentage 0-100
  y: number; // pixels relative to container top
  width: number; // percentage 0-100
  isPlaceholder?: boolean;
}