import type { PuzzleQuery, PuzzleRecord, PuzzleTheme, PuzzleUiCategory } from '@/types/puzzle';

export function isPuzzleInUiCategory(puzzle: PuzzleRecord, category: PuzzleUiCategory): boolean {
  if (category === 'all') return true;
  return puzzle.category === category;
}

export function filterByThemes(puzzles: PuzzleRecord[], themes: PuzzleTheme[] = []): PuzzleRecord[] {
  if (!themes.length) return puzzles;
  return puzzles.filter((puzzle) => themes.every((theme) => puzzle.themes.includes(theme)));
}

export function filterByRatingRange(puzzles: PuzzleRecord[], minRating?: number, maxRating?: number): PuzzleRecord[] {
  return puzzles.filter((puzzle) => {
    if (typeof minRating === 'number' && puzzle.rating < minRating) return false;
    if (typeof maxRating === 'number' && puzzle.rating > maxRating) return false;
    return true;
  });
}

export function sortPuzzles(puzzles: PuzzleRecord[], sortBy: PuzzleQuery['sortBy'] = 'rating'): PuzzleRecord[] {
  const copy = [...puzzles];
  if (sortBy === 'popularity') return copy.sort((a, b) => b.popularity - a.popularity);
  if (sortBy === 'freshness') return copy.sort((a, b) => String(b.metadata.importedAt).localeCompare(String(a.metadata.importedAt)));
  return copy.sort((a, b) => a.rating - b.rating);
}

export function runPuzzleQuery(puzzles: PuzzleRecord[], query: PuzzleQuery): PuzzleRecord[] {
  const byCategory = query.category ? puzzles.filter((puzzle) => isPuzzleInUiCategory(puzzle, query.category!)) : puzzles;
  const byThemes = filterByThemes(byCategory, query.themes);
  const byRating = filterByRatingRange(byThemes, query.minRating, query.maxRating);
  const sorted = sortPuzzles(byRating, query.sortBy);
  const offset = query.offset ?? 0;
  const sliced = sorted.slice(offset);
  if (!query.limit) return sliced;
  return sliced.slice(0, query.limit);
}
