import type { CanonicalPuzzle, PuzzleQuery, PuzzleTheme, PuzzleUiCategory } from '@/types/puzzle';

export function isPuzzleInUiCategory(puzzle: CanonicalPuzzle, category: PuzzleUiCategory): boolean {
  if (category === 'all') return true;
  if (category === 'mate') return puzzle.category === 'mate';
  if (category === 'endgame') return puzzle.category === 'endgame';
  return puzzle.category !== 'mate' && puzzle.category !== 'endgame';
}

export function filterByThemes(puzzles: CanonicalPuzzle[], themes: PuzzleTheme[] = []): CanonicalPuzzle[] {
  if (!themes.length) return puzzles;
  return puzzles.filter((puzzle) => themes.every((theme) => puzzle.themes.includes(theme)));
}

export function filterByRatingRange(puzzles: CanonicalPuzzle[], minRating?: number, maxRating?: number): CanonicalPuzzle[] {
  return puzzles.filter((puzzle) => {
    if (typeof minRating === 'number' && puzzle.rating < minRating) return false;
    if (typeof maxRating === 'number' && puzzle.rating > maxRating) return false;
    return true;
  });
}

export function sortPuzzles(puzzles: CanonicalPuzzle[], sortBy: PuzzleQuery['sortBy'] = 'rating'): CanonicalPuzzle[] {
  const copy = [...puzzles];
  if (sortBy === 'popularity') return copy.sort((a, b) => b.popularity - a.popularity);
  if (sortBy === 'freshness') return copy.sort((a, b) => String(b.metadata.generatedAt).localeCompare(String(a.metadata.generatedAt)));
  return copy.sort((a, b) => a.rating - b.rating);
}

export function runPuzzleQuery(puzzles: CanonicalPuzzle[], query: PuzzleQuery): CanonicalPuzzle[] {
  const byCategory = query.category ? puzzles.filter((puzzle) => isPuzzleInUiCategory(puzzle, query.category!)) : puzzles;
  const byThemes = filterByThemes(byCategory, query.themes);
  const byRating = filterByRatingRange(byThemes, query.minRating, query.maxRating);
  const sorted = sortPuzzles(byRating, query.sortBy);
  const offset = query.offset ?? 0;
  const sliced = sorted.slice(offset);
  if (!query.limit) return sliced;
  return sliced.slice(0, query.limit);
}
