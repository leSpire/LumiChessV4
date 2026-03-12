import type { Puzzle, PuzzleProgress, PuzzleSessionState } from '@/types/puzzle';

export const INITIAL_FEEDBACK = 'Choisis un puzzle pour commencer l’entraînement.';

export function createInitialPuzzleSession(): PuzzleSessionState {
  return {
    activePuzzleId: null,
    activeCategory: 'all',
    status: 'idle',
    currentMoveIndex: 0,
    errors: 0,
    feedback: INITIAL_FEEDBACK,
    playedMoves: [],
    isBusy: false
  };
}

export function createLoadedPuzzleSession(puzzle: Puzzle, activeCategory: PuzzleSessionState['activeCategory']): PuzzleSessionState {
  return {
    activePuzzleId: puzzle.id,
    activeCategory,
    status: 'ready',
    currentMoveIndex: 0,
    errors: 0,
    feedback: 'Puzzle chargé. Trouve le meilleur coup.',
    playedMoves: [],
    isBusy: false
  };
}

export function getPuzzleProgress(session: PuzzleSessionState, puzzle: Puzzle | null): PuzzleProgress {
  const totalPly = puzzle?.solution.length ?? 0;
  const totalPlayerMoves = puzzle?.solution.filter((step) => step.role === 'player').length ?? 0;
  const completedPly = Math.min(totalPly, session.currentMoveIndex);
  const completedPlayerMoves = puzzle
    ? puzzle.solution.slice(0, session.currentMoveIndex).filter((step) => step.role === 'player').length
    : 0;

  return {
    currentPly: completedPly,
    totalPly,
    completedPlayerMoves,
    totalPlayerMoves,
    completionRatio: totalPly === 0 ? 0 : completedPly / totalPly
  };
}

export function getFilteredPuzzles(
  puzzles: Puzzle[],
  category: PuzzleSessionState['activeCategory']
): Puzzle[] {
  if (category === 'all') return puzzles;
  return puzzles.filter((puzzle) => puzzle.category === category || puzzle.themes.includes(category));
}
