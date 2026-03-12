import { Chess, type PieceSymbol, type Square } from 'chess.js';
import type { Puzzle, PuzzleMove, PuzzleProgress, PuzzleResult, PuzzleSessionState } from '@/types/puzzle';

const MAX_ERRORS_DEFAULT = 3;

const toLan = (from: Square, to: Square, promotion?: PieceSymbol) => `${from}${to}${promotion ?? ''}`.toLowerCase();

const normalizeLan = (lan: string) => lan.toLowerCase();

const getExpectedLan = (move: PuzzleMove) => normalizeLan(move.lan);

export const createInitialPuzzleSession = (): PuzzleSessionState => ({
  activePuzzle: null,
  status: 'idle',
  currentMoveIndex: 0,
  errors: 0,
  maxErrors: MAX_ERRORS_DEFAULT,
  feedback: 'Charge un puzzle pour commencer.',
  playedMoves: [],
  result: null,
  isBusy: false
});

export function getPuzzleProgress(state: PuzzleSessionState): PuzzleProgress {
  const totalMoves = state.activePuzzle?.solution.length ?? 0;
  const completedMoves = Math.min(state.currentMoveIndex, totalMoves);
  return {
    currentMoveIndex: state.currentMoveIndex,
    totalMoves,
    completedMoves,
    completionRatio: totalMoves === 0 ? 0 : completedMoves / totalMoves
  };
}

export function validatePuzzleDefinition(puzzle: Puzzle): { ok: true } | { ok: false; reason: string } {
  try {
    const chess = new Chess(puzzle.startFen);

    if (chess.turn() !== puzzle.playerToMove) {
      return { ok: false, reason: 'Le camp à jouer ne correspond pas à la FEN de départ.' };
    }

    for (const step of puzzle.solution) {
      const expectedLan = getExpectedLan(step);
      const from = expectedLan.slice(0, 2) as Square;
      const to = expectedLan.slice(2, 4) as Square;
      const promotion = (expectedLan.slice(4, 5) || undefined) as PieceSymbol | undefined;
      const legal = chess.moves({ verbose: true }).find((move) => toLan(move.from, move.to, move.promotion) === expectedLan);

      if (!legal || legal.from !== from || legal.to !== to || (promotion && legal.promotion !== promotion)) {
        return { ok: false, reason: `Coup attendu illégal ou invalide: ${step.lan}` };
      }

      chess.move({ from, to, promotion });
    }

    return { ok: true };
  } catch {
    return { ok: false, reason: 'Puzzle invalide (FEN ou ligne de solution incorrecte).' };
  }
}

export function createAttemptResult(state: PuzzleSessionState, status: 'failed' | 'solved'): PuzzleResult | null {
  if (!state.activePuzzle) return null;
  return {
    puzzleId: state.activePuzzle.id,
    status,
    errors: state.errors,
    playedMoves: state.playedMoves
  };
}

export function isExpectedUserMove(state: PuzzleSessionState): boolean {
  if (!state.activePuzzle) return false;
  const next = state.activePuzzle.solution[state.currentMoveIndex];
  return next?.role === 'player';
}

export function matchesExpectedMove(
  state: PuzzleSessionState,
  from: Square,
  to: Square,
  promotion?: PieceSymbol
): boolean {
  if (!state.activePuzzle) return false;
  const expected = state.activePuzzle.solution[state.currentMoveIndex];
  if (!expected) return false;
  return getExpectedLan(expected) === toLan(from, to, promotion);
}
