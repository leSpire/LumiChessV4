import type { PuzzlePackValidationResult, PuzzleRecord } from '@/types/puzzle';
import { validatePuzzle } from '@/lib/puzzles/validators/validatePuzzle';

export function validatePuzzlePack(puzzles: PuzzleRecord[]): PuzzlePackValidationResult {
  const valid: PuzzleRecord[] = [];
  const invalid: PuzzlePackValidationResult['invalid'] = [];
  const ids = new Set<string>();

  puzzles.forEach((puzzle) => {
    const errors: string[] = [];
    if (ids.has(puzzle.id)) {
      errors.push('ID dupliqué dans le pack.');
    }
    ids.add(puzzle.id);

    const validation = validatePuzzle(puzzle);
    const combinedErrors = [...errors, ...validation.errors];

    if (combinedErrors.length > 0 || !validation.valid) {
      invalid.push({
        puzzleId: puzzle.id,
        errors: combinedErrors,
        warnings: validation.warnings
      });
      return;
    }

    valid.push({
      ...puzzle,
      validated: true,
      validationErrors: []
    });
  });

  return { valid, invalid };
}
