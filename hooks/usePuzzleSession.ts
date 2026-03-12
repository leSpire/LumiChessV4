'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PieceSymbol, Square } from 'chess.js';
import { useChessGame } from '@/hooks/useChessGame';
import { LOCAL_PUZZLE_CATALOG, PUZZLE_CATEGORIES } from '@/lib/puzzles/catalog';
import { createInitialPuzzleSession, createLoadedPuzzleSession, getFilteredPuzzles, getPuzzleProgress } from '@/lib/puzzles/session';
import { isMoveMatchingUci, validateCatalog } from '@/lib/puzzles/validator';
import type { Puzzle, PuzzleSessionState } from '@/types/puzzle';

export function usePuzzleSession() {
  const game = useChessGame();
  const loadVersionRef = useRef(0);

  const catalogValidation = useMemo(() => validateCatalog(LOCAL_PUZZLE_CATALOG), []);
  const puzzles = catalogValidation.valid;

  const [session, setSession] = useState<PuzzleSessionState>(createInitialPuzzleSession());
  const sessionRef = useRef(session);
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const filteredPuzzles = useMemo(
    () => getFilteredPuzzles(puzzles, session.activeCategory),
    [puzzles, session.activeCategory]
  );

  const activePuzzle = useMemo(
    () => filteredPuzzles.find((puzzle) => puzzle.id === session.activePuzzleId) ?? null,
    [filteredPuzzles, session.activePuzzleId]
  );

  const activePuzzleIndex = useMemo(
    () => filteredPuzzles.findIndex((puzzle) => puzzle.id === session.activePuzzleId),
    [filteredPuzzles, session.activePuzzleId]
  );

  const progress = useMemo(() => getPuzzleProgress(session, activePuzzle), [session, activePuzzle]);

  const loadPuzzle = useCallback(
    (puzzle: Puzzle, category: PuzzleSessionState['activeCategory'] = sessionRef.current.activeCategory) => {
      loadVersionRef.current += 1;
      const requestId = loadVersionRef.current;

      setSession((current) => ({ ...current, isBusy: true }));
      const result = game.loadFen(puzzle.startFen);

      if (requestId !== loadVersionRef.current) return false;

      if (!result.ok) {
        setSession((current) => ({
          ...current,
          activePuzzleId: puzzle.id,
          status: 'failed',
          feedback: result.error?.message ?? 'Impossible de charger la position de puzzle.',
          playedMoves: [],
          currentMoveIndex: 0,
          errors: 0,
          isBusy: false
        }));
        return false;
      }

      game.setOrientation(puzzle.orientation ?? puzzle.sideToMove);
      setSession(createLoadedPuzzleSession(puzzle, category));
      return true;
    },
    [game]
  );

  const loadPuzzleByIndex = useCallback(
    (index: number) => {
      if (!filteredPuzzles.length) {
        setSession((current) => ({
          ...current,
          activePuzzleId: null,
          status: 'idle',
          feedback: 'Aucun puzzle dans cette catégorie.',
          currentMoveIndex: 0,
          playedMoves: [],
          errors: 0,
          isBusy: false
        }));
        return false;
      }

      const boundedIndex = Math.max(0, Math.min(index, filteredPuzzles.length - 1));
      return loadPuzzle(filteredPuzzles[boundedIndex]);
    },
    [filteredPuzzles, loadPuzzle]
  );

  const selectCategory = useCallback(
    (category: PuzzleSessionState['activeCategory']) => {
      const nextList = getFilteredPuzzles(puzzles, category);
      if (!nextList.length) {
        setSession((current) => ({
          ...createInitialPuzzleSession(),
          activeCategory: category,
          feedback: 'Aucun puzzle disponible pour cette catégorie.'
        }));
        return;
      }

      void loadPuzzle(nextList[0], category);
    },
    [loadPuzzle, puzzles]
  );

  const selectPuzzleById = useCallback(
    (puzzleId: string) => {
      const selected = filteredPuzzles.find((puzzle) => puzzle.id === puzzleId);
      if (!selected) return false;
      return loadPuzzle(selected);
    },
    [filteredPuzzles, loadPuzzle]
  );

  const runOpponentReplies = useCallback(() => {
    const current = sessionRef.current;
    const puzzle = activePuzzle;
    if (!puzzle) return;

    let nextIndex = current.currentMoveIndex;
    const playedMoves = [...current.playedMoves];

    while (puzzle.solution[nextIndex]?.role === 'opponent') {
      const reply = puzzle.solution[nextIndex];
      const ok = game.playLanMove(reply.uci);
      if (!ok) {
        setSession((prev) => ({
          ...prev,
          status: 'failed',
          feedback: `Réponse automatique invalide (${reply.uci}).`,
          isBusy: false
        }));
        return;
      }

      playedMoves.push(reply.uci);
      nextIndex += 1;
    }

    const solved = nextIndex >= puzzle.solution.length;
    setSession((prev) => ({
      ...prev,
      currentMoveIndex: nextIndex,
      playedMoves,
      status: solved ? 'solved' : 'in_progress',
      feedback: solved ? 'Bravo, puzzle résolu.' : 'Bonne continuation.',
      isBusy: false
    }));
  }, [activePuzzle, game]);

  const playUserMove = useCallback(
    (from: Square, to: Square, promotion?: PieceSymbol) => {
      const current = sessionRef.current;
      const puzzle = activePuzzle;

      if (!puzzle || current.isBusy || current.status === 'failed' || current.status === 'solved') return;

      const expected = puzzle.solution[current.currentMoveIndex];
      if (!expected || expected.role !== 'player') {
        setSession((prev) => ({ ...prev, feedback: 'Attends la réponse automatique du puzzle.' }));
        return;
      }

      if (!isMoveMatchingUci(from, to, expected.uci, promotion)) {
        const nextErrors = current.errors + 1;
        setSession((prev) => ({
          ...prev,
          errors: nextErrors,
          status: 'failed',
          feedback: 'Coup incorrect. Clique sur Retry pour recommencer ce puzzle.'
        }));
        return;
      }

      const played = game.playLanMove(expected.uci);
      if (!played) {
        setSession((prev) => ({
          ...prev,
          status: 'failed',
          feedback: `Le coup attendu n'a pas pu être appliqué (${expected.uci}).`
        }));
        return;
      }

      const nextIndex = current.currentMoveIndex + 1;
      const playedMoves = [...current.playedMoves, expected.uci];
      if (nextIndex >= puzzle.solution.length) {
        setSession((prev) => ({
          ...prev,
          currentMoveIndex: nextIndex,
          playedMoves,
          status: 'solved',
          feedback: 'Parfait, puzzle terminé.',
          isBusy: false
        }));
        return;
      }

      setSession((prev) => ({
        ...prev,
        status: 'in_progress',
        currentMoveIndex: nextIndex,
        playedMoves,
        feedback: 'Bonne réponse. Réplique adverse en cours…',
        isBusy: true
      }));

      runOpponentReplies();
    },
    [activePuzzle, game, runOpponentReplies]
  );

  const resetPuzzle = useCallback(() => {
    const puzzle = activePuzzle;
    if (!puzzle) return;
    void loadPuzzle(puzzle);
  }, [activePuzzle, loadPuzzle]);

  const retryPuzzle = useCallback(() => {
    const puzzle = activePuzzle;
    if (!puzzle) return;
    void loadPuzzle(puzzle);
  }, [activePuzzle, loadPuzzle]);

  const nextPuzzle = useCallback(() => {
    if (!filteredPuzzles.length) return;
    const nextIndex = Math.min(filteredPuzzles.length - 1, Math.max(0, activePuzzleIndex) + 1);
    void loadPuzzleByIndex(nextIndex);
  }, [activePuzzleIndex, filteredPuzzles.length, loadPuzzleByIndex]);

  const previousPuzzle = useCallback(() => {
    if (!filteredPuzzles.length) return;
    const previousIndex = Math.max(0, Math.max(0, activePuzzleIndex) - 1);
    void loadPuzzleByIndex(previousIndex);
  }, [activePuzzleIndex, filteredPuzzles.length, loadPuzzleByIndex]);

  const revealNextMove = useCallback(() => {
    const current = sessionRef.current;
    if (!activePuzzle) return;
    const next = activePuzzle.solution[current.currentMoveIndex];
    if (!next) return;
    setSession((prev) => ({ ...prev, feedback: `Indice: ${next.san ?? next.uci}` }));
  }, [activePuzzle]);

  useEffect(() => {
    if (!session.activePuzzleId && puzzles.length > 0) {
      void loadPuzzle(puzzles[0], 'all');
    }
  }, [loadPuzzle, puzzles, session.activePuzzleId]);

  return {
    game,
    categories: PUZZLE_CATEGORIES,
    puzzles,
    filteredPuzzles,
    activePuzzle,
    activePuzzleIndex,
    session,
    progress,
    catalogIssues: catalogValidation.issues,
    loadPuzzle,
    loadPuzzleByIndex,
    selectCategory,
    selectPuzzleById,
    playUserMove,
    resetPuzzle,
    retryPuzzle,
    nextPuzzle,
    previousPuzzle,
    revealNextMove
  };
}
