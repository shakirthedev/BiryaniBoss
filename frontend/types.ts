export interface Ingredient {
  id: string;
  emoji: string;
  name: string;
}

export type ScreenState = 'START' | 'PLAY' | 'OVER';

export interface GameState {
  screen: ScreenState;
  score: number;
  highScore: number;
  round: number;
  timeLeft: number;
  maxTime: number;
  currentOrder: Ingredient[];
  orderProgress: number;
  combo: number;
  customerEmoji: string;
  isTransitioning: boolean;
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}

export interface ConfettiParticle {
  id: number;
  emoji: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vr: number;
}
