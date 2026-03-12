'use client';

import { useCallback, useMemo, useState } from 'react';
import type { PieceSymbol, Square } from 'chess.js';
import { useChessGame } from '@/hooks/useChessGame';
import { DEMO_PUZZLES } from '@/lib/puzzles/demoPuzzles';
import {
  createAttemptResult,
  createInitialPuzzleSession,
  getPuzzleProgress,
  isExpectedUserMove,
  matchesExpectedMove,
  validatePuzzleDefinition
} from '@/lib/puzzles/puzzleSession';
import type { Puzzle, PuzzleSessionState } from '@/types/puzzle';

export function usePuzzleTraining() {
  const game = useChessGame();
  const [session, setSession] = useState<PuzzleSessionState>(createInitialPuzzleSession());
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);

  const loadPuzzle = useCallback(
    (puzzle: Puzzle) => {
      const validation = validatePuzzleDefinition(puzzle);
      if (!validation.ok) {
        setSession({
          ...createInitialPuzzleSession(),
          activePuzzle: puzzle,
          status: 'failed',
          feedback: validation.reason,
          result: {
            puzzleId: puzzle.id,
            status: 'failed',
            errors: 0,
            playedMoves: []
          }
        });
        return false;
      }

      const result = game.loadFen(puzzle.startFen);
      if (!result.ok) {
        setSession({
          ...createInitialPuzzleSession(),
          activePuzzle: puzzle,
          status: 'failed',
          feedback: result.error?.message ?? 'Impossible de charger la position du puzzle.'
        });
        return false;
      }

      game.setOrientation(puzzle.orientation ?? puzzle.playerToMove);
      setSession({
        ...createInitialPuzzleSession(),
        activePuzzle: puzzle,
        status: 'ready',
        feedback: 'Puzzle chargé. À toi de jouer.'
      });
      return true;
    },
    [game]
  );

  const loadPuzzleByIndex = useCallback(
    (index: number) => {
      const bounded = (index + DEMO_PUZZLES.length) % DEMO_PUZZLES.length;
      setCurrentPuzzleIndex(bounded);
      return loadPuzzle(DEMO_PUZZLES[bounded]);
    },
    [loadPuzzle]
  );

  const playOpponentReplies = useCallback(() => {
    setSession((current) => {
      if (!current.activePuzzle) return current;
      let nextIndex = current.currentMoveIndex;
      const playedMoves = [...current.playedMoves];

      while (nextIndex < current.activePuzzle.solution.length && current.activePuzzle.solution[nextIndex]?.role === 'opponent') {
        const step = current.activePuzzle.solution[nextIndex];
        const ok = game.playLanMove(step.lan);
        if (!ok) {
          return {
            ...current,
            status: 'failed',
            feedback: `Réponse automatique illégale détectée (${step.lan}).`,
            result: createAttemptResult(current, 'failed')
          };
        }

        playedMoves.push(step.lan);
        nextIndex += 1;
      }

      const solved = nextIndex >= current.activePuzzle.solution.length;
      if (solved) {
        return {
          ...current,
          currentMoveIndex: nextIndex,
          playedMoves,
          status: 'solved',
          feedback: 'Excellent. Puzzle résolu.',
          result: createAttemptResult({ ...current, playedMoves }, 'solved')
        };
      }

      return {
        ...current,
        currentMoveIndex: nextIndex,
        playedMoves,
        status: 'in_progress',
        feedback: 'Bien joué. Trouve le prochain coup.'
      };
    });
  }, [game]);

  const playUserMove = useCallback(
    (from: Square, to: Square, promotion?: PieceSymbol) => {
      setSession((current) => {
        if (!current.activePuzzle) return current;
        if (current.status === 'solved' || current.status === 'failed' || current.isBusy) return current;
        if (!isExpectedUserMove(current)) {
          return {
            ...current,
            feedback: 'Attends la réponse automatique du puzzle.'
          };
        }

        const isCorrect = matchesExpectedMove(current, from, to, promotion);
        if (!isCorrect) {
          const nextErrors = current.errors + 1;
          const failed = nextErrors >= current.maxErrors;
          return {
            ...current,
            errors: nextErrors,
            status: failed ? 'failed' : current.status,
            feedback: failed ? 'Trop d’erreurs. Utilise Retry pour recommencer.' : 'Ce coup ne correspond pas à la solution attendue.',
            result: failed ? createAttemptResult({ ...current, errors: nextErrors }, 'failed') : current.result
          };
        }

        const expected = current.activePuzzle.solution[current.currentMoveIndex];
        const applied = game.playLanMove(expected.lan);
        if (!applied) {
          return {
            ...current,
            status: 'failed',
            feedback: `Le coup validé n’a pas pu être appliqué (${expected.lan}).`,
            result: createAttemptResult(current, 'failed')
          };
        }

        const playedMoves = [...current.playedMoves, expected.lan];
        const nextIndex = current.currentMoveIndex + 1;
        const solved = nextIndex >= current.activePuzzle.solution.length;

        if (solved) {
          return {
            ...current,
            currentMoveIndex: nextIndex,
            playedMoves,
            status: 'solved',
            feedback: 'Parfait. Puzzle terminé.',
            result: createAttemptResult({ ...current, playedMoves }, 'solved')
          };
        }

        return {
          ...current,
          status: 'in_progress',
          currentMoveIndex: nextIndex,
          playedMoves,
          feedback: 'Bon coup. Réponse adverse…'
        };
      });

      playOpponentReplies();
    },
    [game, playOpponentReplies]
  );

  const resetPuzzle = useCallback(() => {
    if (!session.activePuzzle) return;
    void loadPuzzle(session.activePuzzle);
  }, [loadPuzzle, session.activePuzzle]);

  const retryPuzzle = useCallback(() => {
    if (!session.activePuzzle) return;
    void loadPuzzle(session.activePuzzle);
  }, [loadPuzzle, session.activePuzzle]);

  const revealNextMove = useCallback(() => {
    setSession((current) => {
      if (!current.activePuzzle) return current;
      const next = current.activePuzzle.solution[current.currentMoveIndex];
      if (!next) return current;
      return {
        ...current,
        feedback: `Indice: joue ${next.san ?? next.lan}`
      };
    });
  }, []);

  const progress = useMemo(() => getPuzzleProgress(session), [session]);

  return {
    game,
    puzzles: DEMO_PUZZLES,
    session,
    progress,
    currentPuzzleIndex,
    loadPuzzleByIndex,
    loadPuzzle,
    playUserMove,
    resetPuzzle,
    retryPuzzle,
    revealNextMove,
    nextPuzzle: () => loadPuzzleByIndex(currentPuzzleIndex + 1),
    previousPuzzle: () => loadPuzzleByIndex(currentPuzzleIndex - 1)
  };
}
