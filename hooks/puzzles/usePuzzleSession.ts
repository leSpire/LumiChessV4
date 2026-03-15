'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PieceSymbol, Square } from 'chess.js';
import { useChessGame } from '@/hooks/useChessGame';
import { usePuzzleCatalog } from '@/hooks/puzzles/usePuzzleCatalog';
import {
  createInitialPuzzleSession,
  createLoadedPuzzleSession,
  createLoadingPuzzleSession,
  getPuzzleProgress
} from '@/lib/puzzles/session/createPuzzleSession';
import { isMoveMatchingExpectedUci } from '@/lib/puzzles/validators/validatePuzzle';
import type { PuzzleRecord, PuzzleSessionState } from '@/types/puzzle';

export function usePuzzleSession() {
  const game = useChessGame();
  const catalog = usePuzzleCatalog();
  const loadTokenRef = useRef(0);

  const [session, setSession] = useState<PuzzleSessionState>(createInitialPuzzleSession());
  const sessionRef = useRef(session);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const activePuzzle = useMemo(
    () => catalog.filteredPuzzles.find((puzzle) => puzzle.id === session.activePuzzleId) ?? null,
    [catalog.filteredPuzzles, session.activePuzzleId]
  );

  const activePuzzleIndex = useMemo(
    () => catalog.filteredPuzzles.findIndex((puzzle) => puzzle.id === session.activePuzzleId),
    [catalog.filteredPuzzles, session.activePuzzleId]
  );

  const progress = useMemo(() => getPuzzleProgress(session, activePuzzle), [activePuzzle, session]);

  const completeSolvedState = useCallback((nextIndex: number, playedMoves: string[]) => {
    setSession((prev) => ({
      ...prev,
      currentMoveIndex: nextIndex,
      playedMoves,
      status: 'solved',
      completionState: 'solved',
      feedback: '✅ Puzzle réussi. Prêt pour le suivant.',
      canGoNext: true,
      canRetry: true,
      isBusy: false
    }));
  }, []);

  const loadPuzzle = useCallback(
    (puzzle: PuzzleRecord, category = sessionRef.current.activeCategory) => {
      loadTokenRef.current += 1;
      const token = loadTokenRef.current;

      setSession(createLoadingPuzzleSession(category));

      const result = game.loadFen(puzzle.startFen);
      if (token !== loadTokenRef.current) return false;

      if (!result.ok) {
        setSession((prev) => ({
          ...prev,
          activePuzzleId: puzzle.id,
          status: 'invalid',
          completionState: 'failed',
          feedback: result.error?.message ?? 'Puzzle invalide: FEN non chargeable.',
          errors: [result.error?.message ?? 'loadFen failed'],
          canGoNext: true,
          canRetry: false,
          isBusy: false
        }));
        return false;
      }

      game.setOrientation(puzzle.orientation);
      setSession(createLoadedPuzzleSession(puzzle, category));
      return true;
    },
    [game]
  );

  const runOpponentMoves = useCallback(
    (puzzle: PuzzleRecord, fromIndex: number, playedMovesStart: string[]) => {
      const tokenAtStart = loadTokenRef.current;
      let idx = fromIndex;
      const playedMoves = [...playedMovesStart];

      while (idx < puzzle.solutionLine.length && idx % 2 === 1) {
        if (tokenAtStart !== loadTokenRef.current) return;

        const reply = puzzle.solutionLine[idx].uci;
        if (!game.playLanMove(reply)) {
          setSession((prev) => ({
            ...prev,
            status: 'invalid',
            completionState: 'failed',
            feedback: `Puzzle corrompu: réponse auto illégale (${reply}).`,
            errors: [...prev.errors, `auto:${reply}`],
            canGoNext: true,
            canRetry: true,
            isBusy: false
          }));
          return;
        }

        playedMoves.push(reply);
        idx += 1;
      }

      if (idx >= puzzle.solutionLine.length) {
        completeSolvedState(idx, playedMoves);
        return;
      }

      setSession((prev) => ({
        ...prev,
        currentMoveIndex: idx,
        playedMoves,
        status: 'in_progress',
        feedback: '✅ Bon coup. À toi de continuer.',
        canGoNext: false,
        canRetry: true,
        isBusy: false
      }));
    },
    [completeSolvedState, game]
  );

  const playUserMove = useCallback(
    (from: Square, to: Square, promotion?: PieceSymbol) => {
      const current = sessionRef.current;
      const puzzle = activePuzzle;
      if (!puzzle || current.isBusy || ['loading', 'solved', 'failed', 'invalid'].includes(current.status)) return;

      const expected = puzzle.solutionLine[current.currentMoveIndex]?.uci;
      if (!expected) return;

      if (!isMoveMatchingExpectedUci(from, to, expected, promotion)) {
        setSession((prev) => ({
          ...prev,
          status: 'failed',
          completionState: 'failed',
          errors: [...prev.errors, `wrong:${from}${to}${promotion ?? ''}`],
          feedback: '❌ Mauvais coup. Ce puzzle est échoué. Clique sur “Réessayer”.',
          canRetry: true,
          canGoNext: true
        }));
        return;
      }

      if (!game.playLanMove(expected)) {
        setSession((prev) => ({
          ...prev,
          status: 'invalid',
          completionState: 'failed',
          errors: [...prev.errors, `invalid:${expected}`],
          feedback: `Puzzle corrompu: le coup attendu ${expected} est illégal.`,
          canRetry: true,
          canGoNext: true,
          isBusy: false
        }));
        return;
      }

      const nextIndex = current.currentMoveIndex + 1;
      const playedMoves = [...current.playedMoves, expected];

      if (nextIndex >= puzzle.solutionLine.length) {
        completeSolvedState(nextIndex, playedMoves);
        return;
      }

      setSession((prev) => ({
        ...prev,
        currentMoveIndex: nextIndex,
        playedMoves,
        status: 'in_progress',
        completionState: 'none',
        feedback: 'Bon coup. Réponse adverse en cours…',
        canRetry: true,
        canGoNext: false,
        isBusy: true
      }));

      window.setTimeout(() => runOpponentMoves(puzzle, nextIndex, playedMoves), 60);
    },
    [activePuzzle, completeSolvedState, game, runOpponentMoves]
  );

  const loadPuzzleByIndex = useCallback(
    (index: number) => {
      if (!catalog.filteredPuzzles.length) return false;
      const bounded = Math.max(0, Math.min(catalog.filteredPuzzles.length - 1, index));
      return loadPuzzle(catalog.filteredPuzzles[bounded], sessionRef.current.activeCategory);
    },
    [catalog.filteredPuzzles, loadPuzzle]
  );

  const selectCategory = useCallback(
    (category: PuzzleSessionState['activeCategory']) => {
      catalog.setActiveCategory(category);
      setSession((prev) => ({ ...createInitialPuzzleSession(), activeCategory: category }));
    },
    [catalog]
  );

  useEffect(() => {
    if (!catalog.filteredPuzzles.length) {
      setSession((prev) => ({ ...prev, status: 'idle', feedback: 'Aucun puzzle valide avec ce filtre.', activePuzzleId: null }));
      return;
    }

    if (!session.activePuzzleId || !catalog.filteredPuzzles.some((puzzle) => puzzle.id === session.activePuzzleId)) {
      void loadPuzzle(catalog.filteredPuzzles[0], session.activeCategory);
    }
  }, [catalog.filteredPuzzles, loadPuzzle, session.activeCategory, session.activePuzzleId]);

  return {
    game,
    session,
    progress,
    categories: catalog.categories,
    filteredPuzzles: catalog.filteredPuzzles,
    activePuzzle,
    activePuzzleIndex,
    selectCategory,
    loadPuzzleByIndex,
    selectPuzzleById: (id: string) => {
      const selected = catalog.byId[id];
      if (!selected) return false;
      return loadPuzzle(selected, sessionRef.current.activeCategory);
    },
    nextPuzzle: () => loadPuzzleByIndex(activePuzzleIndex + 1),
    previousPuzzle: () => loadPuzzleByIndex(activePuzzleIndex - 1),
    resetPuzzle: () => (activePuzzle ? loadPuzzle(activePuzzle, sessionRef.current.activeCategory) : false),
    retryPuzzle: () => (activePuzzle ? loadPuzzle(activePuzzle, sessionRef.current.activeCategory) : false),
    revealNextMove: () => {
      const current = sessionRef.current;
      const next = activePuzzle?.solutionLine[current.currentMoveIndex]?.uci;
      if (next) setSession((prev) => ({ ...prev, feedback: `Indice: ${next}` }));
    },
    playUserMove,
    setRatingRange: catalog.setRatingRange,
    setThemesFilter: catalog.setActiveThemes
  };
}
