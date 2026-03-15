import devPack from '@/data/puzzles/dev-pack.json';
import type { PuzzleId, PuzzleQuery, PuzzleRecord, PuzzleTheme, PuzzleUiCategory } from '@/types/puzzle';
import { runPuzzleQuery } from '@/lib/puzzles/selectors/puzzleSelectors';
import { validatePuzzlePack } from '@/lib/puzzles/validators/validatePuzzlePack';

const LOCAL_PUZZLES = devPack as PuzzleRecord[];

export class PuzzleRepository {
  private readonly puzzles: PuzzleRecord[];

  constructor(seed: PuzzleRecord[] = LOCAL_PUZZLES) {
    const validation = validatePuzzlePack(seed);
    this.puzzles = validation.valid;

    if (validation.invalid.length) {
      // eslint-disable-next-line no-console
      console.warn('[LumiChess][puzzles] Invalid puzzles filtered out:', validation.invalid);
    }
  }

  getPuzzleById(id: PuzzleId): PuzzleRecord | null {
    return this.puzzles.find((puzzle) => puzzle.id === id) ?? null;
  }

  getNextPuzzle(currentId: PuzzleId, query: PuzzleQuery = {}): PuzzleRecord | null {
    const scoped = runPuzzleQuery(this.puzzles, query);
    const index = scoped.findIndex((puzzle) => puzzle.id === currentId);
    if (index < 0 || index === scoped.length - 1) return scoped[0] ?? null;
    return scoped[index + 1] ?? null;
  }

  getPreviousPuzzle(currentId: PuzzleId, query: PuzzleQuery = {}): PuzzleRecord | null {
    const scoped = runPuzzleQuery(this.puzzles, query);
    const index = scoped.findIndex((puzzle) => puzzle.id === currentId);
    if (index <= 0) return scoped[scoped.length - 1] ?? null;
    return scoped[index - 1] ?? null;
  }

  getPuzzleBatch(query: PuzzleQuery = {}): PuzzleRecord[] {
    return runPuzzleQuery(this.puzzles, query);
  }

  filterByCategory(category: PuzzleUiCategory): PuzzleRecord[] {
    return runPuzzleQuery(this.puzzles, { category });
  }

  filterByThemes(themes: PuzzleTheme[]): PuzzleRecord[] {
    return runPuzzleQuery(this.puzzles, { themes });
  }

  filterByRatingRange(minRating?: number, maxRating?: number): PuzzleRecord[] {
    return runPuzzleQuery(this.puzzles, { minRating, maxRating });
  }

  getAll(): PuzzleRecord[] {
    return [...this.puzzles];
  }
}

export const puzzleRepository = new PuzzleRepository();
