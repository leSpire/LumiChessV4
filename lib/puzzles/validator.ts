import { Chess, type PieceSymbol, type Square } from 'chess.js';
import type { Puzzle, PuzzleCatalogValidationIssue } from '@/types/puzzle';

const normalizeUci = (uci: string) => uci.trim().toLowerCase();

const toUci = (from: Square, to: Square, promotion?: PieceSymbol) => `${from}${to}${promotion ?? ''}`.toLowerCase();

export function validatePuzzle(puzzle: Puzzle): { ok: true } | { ok: false; reason: string } {
  if (!puzzle.solution.length) {
    return { ok: false, reason: 'La solution est vide.' };
  }

  if (puzzle.solution[0]?.role !== 'player') {
    return { ok: false, reason: 'Le premier coup de la solution doit être joué par le joueur.' };
  }

  try {
    const chess = new Chess(puzzle.startFen);

    if (chess.turn() !== puzzle.sideToMove) {
      return { ok: false, reason: 'Le camp à jouer ne correspond pas à la FEN.' };
    }

    for (let index = 0; index < puzzle.solution.length; index += 1) {
      const step = puzzle.solution[index];
      const normalized = normalizeUci(step.uci);
      const from = normalized.slice(0, 2) as Square;
      const to = normalized.slice(2, 4) as Square;
      const promotion = (normalized.slice(4, 5) || undefined) as PieceSymbol | undefined;

      const legal = chess
        .moves({ verbose: true })
        .find((move) => toUci(move.from, move.to, move.promotion) === normalized);

      if (!legal) {
        return { ok: false, reason: `Coup illégal à l'étape ${index + 1}: ${step.uci}.` };
      }

      chess.move({ from, to, promotion });

      if (index < puzzle.solution.length - 1) {
        const expectedRole = puzzle.solution[index + 1]?.role;
        const shouldBePlayersTurn = expectedRole === 'player';
        if ((chess.turn() === puzzle.sideToMove) !== shouldBePlayersTurn) {
          return { ok: false, reason: `Alternance de rôles invalide à l'étape ${index + 2}.` };
        }
      }
    }

    return { ok: true };
  } catch {
    return { ok: false, reason: 'FEN invalide ou solution non exécutable.' };
  }
}

export function validateCatalog(puzzles: Puzzle[]): { valid: Puzzle[]; issues: PuzzleCatalogValidationIssue[] } {
  const issues: PuzzleCatalogValidationIssue[] = [];
  const valid: Puzzle[] = [];
  const ids = new Set<string>();

  puzzles.forEach((puzzle) => {
    if (ids.has(puzzle.id)) {
      issues.push({ puzzleId: puzzle.id, reason: 'ID dupliqué.' });
      return;
    }
    ids.add(puzzle.id);

    const validation = validatePuzzle(puzzle);
    if (!validation.ok) {
      issues.push({ puzzleId: puzzle.id, reason: validation.reason });
      return;
    }

    valid.push(puzzle);
  });

  return { valid, issues };
}

export function isMoveMatchingUci(from: Square, to: Square, expectedUci: string, promotion?: PieceSymbol): boolean {
  return toUci(from, to, promotion) === normalizeUci(expectedUci);
}
