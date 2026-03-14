import devPack from '@/data/puzzles/dev-pack.json';
import type { CanonicalPuzzle, PuzzleId, PuzzleQuery, PuzzleTheme, PuzzleUiCategory } from '@/types/puzzle';
import { runPuzzleQuery } from '@/lib/puzzles/selectors/puzzleSelectors';
import { validateCatalog } from '@/lib/puzzles/validators/validatePuzzle';

const LOCAL_PUZZLES = devPack as CanonicalPuzzle[];

export class PuzzleRepository {
  private readonly puzzles: CanonicalPuzzle[];

  constructor(seed: CanonicalPuzzle[] = LOCAL_PUZZLES) {
    this.puzzles = validateCatalog(seed).valid;
  }

  getPuzzleById(id: PuzzleId): CanonicalPuzzle | null {
    return this.puzzles.find((puzzle) => puzzle.id === id) ?? null;
  }

  getNextPuzzle(currentId: PuzzleId, query: PuzzleQuery = {}): CanonicalPuzzle | null {
    const scoped = runPuzzleQuery(this.puzzles, query);
    const index = scoped.findIndex((puzzle) => puzzle.id === currentId);
    if (index < 0 || index === scoped.length - 1) return scoped[0] ?? null;
    return scoped[index + 1] ?? null;
  }

  getPreviousPuzzle(currentId: PuzzleId, query: PuzzleQuery = {}): CanonicalPuzzle | null {
    const scoped = runPuzzleQuery(this.puzzles, query);
    const index = scoped.findIndex((puzzle) => puzzle.id === currentId);
    if (index <= 0) return scoped[scoped.length - 1] ?? null;
    return scoped[index - 1] ?? null;
  }

  getRandomPuzzleByCategory(category: PuzzleUiCategory): CanonicalPuzzle | null {
    const scoped = runPuzzleQuery(this.puzzles, { category });
    if (!scoped.length) return null;
    return scoped[Math.floor(Math.random() * scoped.length)] ?? null;
  }

  getPuzzleBatch(query: PuzzleQuery = {}): CanonicalPuzzle[] {
    return runPuzzleQuery(this.puzzles, query);
  }

  filterByCategory(category: PuzzleUiCategory): CanonicalPuzzle[] {
    return runPuzzleQuery(this.puzzles, { category });
  }

  filterByThemes(themes: PuzzleTheme[]): CanonicalPuzzle[] {
    return runPuzzleQuery(this.puzzles, { themes });
  }

  filterByRatingRange(minRating?: number, maxRating?: number): CanonicalPuzzle[] {
    return runPuzzleQuery(this.puzzles, { minRating, maxRating });
  }

  getAll(): CanonicalPuzzle[] {
    return [...this.puzzles];
  }
}

export const puzzleRepository = new PuzzleRepository();
