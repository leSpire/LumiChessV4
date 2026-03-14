import type { CanonicalPuzzle, PuzzleProgress, PuzzleSessionState, PuzzleUiCategory } from '@/types/puzzle';

export const INITIAL_PUZZLE_FEEDBACK = 'Choisis un puzzle pour commencer.';

export function createInitialPuzzleSession(): PuzzleSessionState {
  return {
    activePuzzleId: null,
    status: 'idle',
    currentMoveIndex: 0,
    errors: 0,
    feedback: INITIAL_PUZZLE_FEEDBACK,
    playedMoves: [],
    activeCategory: 'all',
    isBusy: false
  };
}

export function createLoadedPuzzleSession(puzzle: CanonicalPuzzle, category: PuzzleUiCategory): PuzzleSessionState {
  return {
    activePuzzleId: puzzle.id,
    status: 'ready',
    currentMoveIndex: 0,
    errors: 0,
    feedback: 'Puzzle chargé. À toi de jouer.',
    playedMoves: [],
    activeCategory: category,
    isBusy: false
  };
}

export function getPuzzleProgress(session: PuzzleSessionState, puzzle: CanonicalPuzzle | null): PuzzleProgress {
  const totalPly = puzzle?.solutionLineUci.length ?? 0;
  const currentPly = Math.min(totalPly, session.currentMoveIndex);

  return {
    currentPly,
    totalPly,
    completionRatio: totalPly === 0 ? 0 : currentPly / totalPly
  };
}
