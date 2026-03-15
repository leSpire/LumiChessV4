import type { PuzzleCategoryDefinition } from '@/types/puzzle';

export const PUZZLE_UI_CATEGORIES: PuzzleCategoryDefinition[] = [
  { id: 'all', label: 'Tous', description: 'Tous les puzzles validés.' },
  { id: 'mate', label: 'Mats', description: 'Mat en 1, 2 ou 3.' },
  { id: 'tactic', label: 'Tactiques', description: 'Fourchette, clouage, enfilade, etc.' },
  { id: 'endgame', label: 'Finales', description: 'Promotion et technique élémentaire.' }
];
