import type { PuzzleProgress, PuzzleRecord, PuzzleSessionState, PuzzleUiCategory } from '@/types/puzzle';

export const INITIAL_PUZZLE_FEEDBACK = 'Choisis un puzzle validé pour commencer.';

export function createInitialPuzzleSession(): PuzzleSessionState {
  return {
    activePuzzleId: null,
    status: 'idle',
    completionState: 'none',
    currentMoveIndex: 0,
    errors: [],
    feedback: INITIAL_PUZZLE_FEEDBACK,
    playedMoves: [],
    activeCategory: 'all',
    canGoNext: false,
    canRetry: false,
    isBusy: false
  };
}

export function createLoadingPuzzleSession(category: PuzzleUiCategory): PuzzleSessionState {
  return {
    ...createInitialPuzzleSession(),
    status: 'loading',
    feedback: 'Chargement du puzzle…',
    activeCategory: category,
    isBusy: true
  };
}

export function createLoadedPuzzleSession(puzzle: PuzzleRecord, category: PuzzleUiCategory): PuzzleSessionState {
  return {
    activePuzzleId: puzzle.id,
    status: 'ready',
    completionState: 'none',
    currentMoveIndex: 0,
    errors: [],
    feedback: 'Puzzle chargé. Trouve le meilleur coup.',
    playedMoves: [],
    activeCategory: category,
    canGoNext: false,
    canRetry: true,
    isBusy: false
  };
}

export function getPuzzleProgress(session: PuzzleSessionState, puzzle: PuzzleRecord | null): PuzzleProgress {
  const totalPly = puzzle?.solutionLine.length ?? 0;
  const currentPly = Math.min(totalPly, session.currentMoveIndex);

  return {
    currentPly,
    totalPly,
    completionRatio: totalPly === 0 ? 0 : currentPly / totalPly
  };
}
