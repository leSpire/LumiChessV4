import type { PuzzleCategoryDefinition } from '@/types/puzzle';

export const PUZZLE_UI_CATEGORIES: PuzzleCategoryDefinition[] = [
  { id: 'all', label: 'Tous', description: 'Tous les puzzles disponibles.' },
  { id: 'mate', label: 'Mats', description: 'Mat en 1, 2 ou 3.' },
  { id: 'tactics', label: 'Tactiques', description: 'Combinaisons tactiques classiques.' },
  { id: 'endgame', label: 'Finales', description: 'Séquences techniques de finale.' }
];
