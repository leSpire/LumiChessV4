'use client';

import { useMemo, useState } from 'react';
import { PUZZLE_UI_CATEGORIES } from '@/lib/puzzles/catalog/puzzleCategories';
import { puzzleRepository } from '@/lib/puzzles/catalog/puzzleRepository';
import type { PuzzleCatalogState, PuzzleRecord, PuzzleTheme } from '@/types/puzzle';

export function usePuzzleCatalog() {
  const [catalogState, setCatalogState] = useState<PuzzleCatalogState>({
    activeCategory: 'all',
    activeThemes: [],
    ratingRange: {}
  });

  const filteredPuzzles = useMemo(
    () =>
      puzzleRepository.getPuzzleBatch({
        category: catalogState.activeCategory,
        themes: catalogState.activeThemes,
        minRating: catalogState.ratingRange.min,
        maxRating: catalogState.ratingRange.max
      }),
    [catalogState]
  );

  const byId = useMemo(
    () =>
      filteredPuzzles.reduce<Record<string, PuzzleRecord>>((acc, puzzle) => {
        acc[puzzle.id] = puzzle;
        return acc;
      }, {}),
    [filteredPuzzles]
  );

  return {
    categories: PUZZLE_UI_CATEGORIES,
    catalogState,
    setActiveCategory: (activeCategory: PuzzleCatalogState['activeCategory']) =>
      setCatalogState((prev) => ({ ...prev, activeCategory })),
    setRatingRange: (ratingRange: PuzzleCatalogState['ratingRange']) =>
      setCatalogState((prev) => ({ ...prev, ratingRange })),
    setActiveThemes: (activeThemes: PuzzleTheme[]) => setCatalogState((prev) => ({ ...prev, activeThemes })),
    filteredPuzzles,
    byId
  };
}
