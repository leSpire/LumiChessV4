'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PieceSymbol, Square } from 'chess.js';
import { useChessGame } from '@/hooks/useChessGame';
import { usePuzzleCatalog } from '@/hooks/puzzles/usePuzzleCatalog';
import { createInitialPuzzleSession, createLoadedPuzzleSession, getPuzzleProgress } from '@/lib/puzzles/session/createPuzzleSession';
import { isMoveMatchingExpectedUci } from '@/lib/puzzles/validators/validatePuzzle';
import type { CanonicalPuzzle, PuzzleSessionState } from '@/types/puzzle';

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

  const loadPuzzle = useCallback(
    (puzzle: CanonicalPuzzle, category = sessionRef.current.activeCategory) => {
      loadTokenRef.current += 1;
      const token = loadTokenRef.current;

      setSession((prev) => ({ ...prev, isBusy: true }));
      const result = game.loadFen(puzzle.startFen);
      if (token !== loadTokenRef.current) return false;

      if (!result.ok) {
        setSession((prev) => ({
          ...prev,
          activePuzzleId: puzzle.id,
          status: 'failed',
          feedback: result.error?.message ?? 'Position puzzle invalide.',
          currentMoveIndex: 0,
          playedMoves: [],
          errors: 0,
          isBusy: false
        }));
        return false;
      }

      game.setOrientation(puzzle.initialPlayerToMove);
      setSession(createLoadedPuzzleSession(puzzle, category));
      return true;
    },
    [game]
  );

  const loadPuzzleByIndex = useCallback(
    (index: number) => {
      if (!catalog.filteredPuzzles.length) return false;
      const bounded = Math.max(0, Math.min(catalog.filteredPuzzles.length - 1, index));
      return loadPuzzle(catalog.filteredPuzzles[bounded]);
    },
    [catalog.filteredPuzzles, loadPuzzle]
  );

  const selectCategory = useCallback(
    (category: PuzzleSessionState['activeCategory']) => {
      catalog.setActiveCategory(category);
      setSession((prev) => ({ ...prev, activeCategory: category, activePuzzleId: null }));
    },
    [catalog]
  );

  useEffect(() => {
    if (!catalog.filteredPuzzles.length) {
      setSession((prev) => ({ ...prev, status: 'idle', feedback: 'Aucun puzzle avec ce filtre.', activePuzzleId: null }));
      return;
    }

    if (!session.activePuzzleId || !catalog.filteredPuzzles.some((puzzle) => puzzle.id === session.activePuzzleId)) {
      void loadPuzzle(catalog.filteredPuzzles[0], session.activeCategory);
    }
  }, [catalog.filteredPuzzles, loadPuzzle, session.activeCategory, session.activePuzzleId]);

  const runOpponentMoves = useCallback(() => {
    const current = sessionRef.current;
    const puzzle = activePuzzle;
    if (!puzzle) return;

    let idx = current.currentMoveIndex;
    const playedMoves = [...current.playedMoves];

    while (idx < puzzle.solutionLineUci.length && idx % 2 === 1) {
      const reply = puzzle.solutionLineUci[idx];
      if (!game.playLanMove(reply)) {
        setSession((prev) => ({ ...prev, status: 'failed', feedback: `Réponse auto invalide (${reply}).`, isBusy: false }));
        return;
      }
      playedMoves.push(reply);
      idx += 1;
    }

    setSession((prev) => ({
      ...prev,
      currentMoveIndex: idx,
      playedMoves,
      status: idx >= puzzle.solutionLineUci.length ? 'solved' : 'in_progress',
      feedback: idx >= puzzle.solutionLineUci.length ? 'Puzzle résolu.' : 'À toi de jouer.',
      isBusy: false
    }));
  }, [activePuzzle, game]);

  const playUserMove = useCallback(
    (from: Square, to: Square, promotion?: PieceSymbol) => {
      const current = sessionRef.current;
      const puzzle = activePuzzle;
      if (!puzzle || current.isBusy || current.status === 'failed' || current.status === 'solved') return;

      const expected = puzzle.solutionLineUci[current.currentMoveIndex];
      if (!expected) return;

      if (!isMoveMatchingExpectedUci(from, to, expected, promotion)) {
        setSession((prev) => ({
          ...prev,
          errors: prev.errors + 1,
          status: 'failed',
          feedback: 'Coup incorrect. Clique sur Retry.'
        }));
        return;
      }

      if (!game.playLanMove(expected)) {
        setSession((prev) => ({ ...prev, status: 'failed', feedback: `Le coup ${expected} ne peut pas être joué.` }));
        return;
      }

      const nextIndex = current.currentMoveIndex + 1;
      const nextPlayed = [...current.playedMoves, expected];
      if (nextIndex >= puzzle.solutionLineUci.length) {
        setSession((prev) => ({ ...prev, currentMoveIndex: nextIndex, playedMoves: nextPlayed, status: 'solved', feedback: 'Parfait.' }));
        return;
      }

      setSession((prev) => ({
        ...prev,
        currentMoveIndex: nextIndex,
        playedMoves: nextPlayed,
        status: 'in_progress',
        feedback: 'Bonne réponse. Réplique adverse…',
        isBusy: true
      }));

      runOpponentMoves();
    },
    [activePuzzle, game, runOpponentMoves]
  );

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
      return loadPuzzle(selected);
    },
    nextPuzzle: () => loadPuzzleByIndex(activePuzzleIndex + 1),
    previousPuzzle: () => loadPuzzleByIndex(activePuzzleIndex - 1),
    resetPuzzle: () => (activePuzzle ? loadPuzzle(activePuzzle) : false),
    retryPuzzle: () => (activePuzzle ? loadPuzzle(activePuzzle) : false),
    revealNextMove: () => {
      const current = sessionRef.current;
      const next = activePuzzle?.solutionLineUci[current.currentMoveIndex];
      if (next) setSession((prev) => ({ ...prev, feedback: `Indice: ${next}` }));
    },
    playUserMove,
    setRatingRange: catalog.setRatingRange,
    setThemesFilter: catalog.setActiveThemes
  };
}
