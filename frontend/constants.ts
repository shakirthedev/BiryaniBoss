import { Ingredient } from './types';

export const COLORS = {
  bg: '#2C1810',
  primary: '#F4A829',
  secondary: '#C0392B',
  surface: '#FDF3E3',
  text: '#1C1C1E',
  success: '#34C759',
  fail: '#FF3B30',
};

export const INGREDIENTS: Ingredient[] = [
  { id: 'chawal', emoji: '🍚', name: 'Chawal' },
  { id: 'gosht', emoji: '🥩', name: 'Gosht' },
  { id: 'pyaaz', emoji: '🧅', name: 'Pyaaz' },
  { id: 'tamatar', emoji: '🍅', name: 'Tamatar' },
  { id: 'mirch', emoji: '🌶️', name: 'Laal Mirch' },
  { id: 'tel', emoji: '🫚', name: 'Tel' },
  { id: 'lehsan', emoji: '🧄', name: 'Lehsan' },
  { id: 'masala', emoji: '🫙', name: 'Masala' },
  { id: 'paani', emoji: '💧', name: 'Paani' },
  { id: 'podina', emoji: '🍃', name: 'Podina' },
];

export const CUSTOMERS = ['👨‍🍳', '👩🦱', '👴', '👨', '🧔', '👩', '👴🏽', '🧑'];

export const getRoundConfig = (round: number) => {
  if (round === 1) return { count: 3, time: 20 };
  if (round === 2) return { count: 4, time: 18 };
  if (round === 3) return { count: 5, time: 16 };
  return { count: 6, time: Math.max(10, 14 - Math.floor((round - 4) / 2)) };
};
