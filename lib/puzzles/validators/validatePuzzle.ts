import { Chess, type PieceSymbol, type Square } from 'chess.js';
import type { CanonicalPuzzle, PuzzleValidationIssue } from '@/types/puzzle';

const normalizeUci = (uci: string) => uci.trim().toLowerCase();

const toUci = (from: Square, to: Square, promotion?: PieceSymbol) => `${from}${to}${promotion ?? ''}`.toLowerCase();

export function validatePuzzle(puzzle: CanonicalPuzzle): { ok: true } | { ok: false; reason: string } {
  if (!puzzle.solutionLineUci.length) {
    return { ok: false, reason: 'Solution vide.' };
  }

  try {
    const chess = new Chess(puzzle.startFen);
    if (chess.turn() !== puzzle.initialPlayerToMove) {
      return { ok: false, reason: 'Side to move incohérent avec la FEN.' };
    }

    for (let index = 0; index < puzzle.solutionLineUci.length; index += 1) {
      const step = normalizeUci(puzzle.solutionLineUci[index]);
      if (step.length < 4) {
        return { ok: false, reason: `UCI invalide à l'étape ${index + 1}.` };
      }

      const legal = chess
        .moves({ verbose: true })
        .find((move) => toUci(move.from, move.to, move.promotion) === step);

      if (!legal) {
        return { ok: false, reason: `Coup illégal à l'étape ${index + 1}: ${step}.` };
      }

      chess.move(legal);
    }

    return { ok: true };
  } catch {
    return { ok: false, reason: 'FEN invalide ou ligne non rejouable.' };
  }
}

export function validateCatalog(puzzles: CanonicalPuzzle[]): { valid: CanonicalPuzzle[]; issues: PuzzleValidationIssue[] } {
  const ids = new Set<string>();
  const valid: CanonicalPuzzle[] = [];
  const issues: PuzzleValidationIssue[] = [];

  puzzles.forEach((puzzle) => {
    if (ids.has(puzzle.id)) {
      issues.push({ puzzleId: puzzle.id, reason: 'ID dupliqué.' });
      return;
    }
    ids.add(puzzle.id);

    const result = validatePuzzle(puzzle);
    if (!result.ok) {
      issues.push({ puzzleId: puzzle.id, reason: result.reason });
      return;
    }

    valid.push(puzzle);
  });

  return { valid, issues };
}

export function isMoveMatchingExpectedUci(
  from: Square,
  to: Square,
  expectedUci: string,
  promotion?: PieceSymbol
): boolean {
  return toUci(from, to, promotion) === normalizeUci(expectedUci);
}
