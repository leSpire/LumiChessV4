'use client';

import { useMemo, useState } from 'react';
import { PUZZLE_UI_CATEGORIES } from '@/lib/puzzles/catalog/puzzleCategories';
import { puzzleRepository } from '@/lib/puzzles/catalog/puzzleRepository';
import type { CanonicalPuzzle, PuzzleTheme, PuzzleUiCategory } from '@/types/puzzle';

interface RatingRange {
  min?: number;
  max?: number;
}

export function usePuzzleCatalog() {
  const [activeCategory, setActiveCategory] = useState<PuzzleUiCategory>('all');
  const [ratingRange, setRatingRange] = useState<RatingRange>({});
  const [activeThemes, setActiveThemes] = useState<PuzzleTheme[]>([]);

  const filteredPuzzles = useMemo(
    () => puzzleRepository.getPuzzleBatch({ category: activeCategory, themes: activeThemes, minRating: ratingRange.min, maxRating: ratingRange.max }),
    [activeCategory, activeThemes, ratingRange.max, ratingRange.min]
  );

  const byId = useMemo(
    () => filteredPuzzles.reduce<Record<string, CanonicalPuzzle>>((acc, puzzle) => {
      acc[puzzle.id] = puzzle;
      return acc;
    }, {}),
    [filteredPuzzles]
  );

  return {
    categories: PUZZLE_UI_CATEGORIES,
    activeCategory,
    setActiveCategory,
    ratingRange,
    setRatingRange,
    activeThemes,
    setActiveThemes,
    filteredPuzzles,
    byId
  };
}
