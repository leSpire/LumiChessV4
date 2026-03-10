'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Color, Square } from 'chess.js';
import { DEFAULT_AI_LEVEL, AI_LEVELS } from '@/lib/engine/levels';
import { useChessEngine } from '@/hooks/useChessEngine';
import { useChessGame } from '@/hooks/useChessGame';
import type { AiDifficultyConfig, AiSkillLevel } from '@/types/engine';

export function usePlayVsAI() {
  const game = useChessGame();
  const engine = useChessEngine();
  const [enabled, setEnabled] = useState(true);
  const [playerColor, setPlayerColor] = useState<Color>('w');
  const [level, setLevel] = useState<AiSkillLevel>(DEFAULT_AI_LEVEL);
  const [showBestMove, setShowBestMove] = useState(true);
  const [showThreats, setShowThreats] = useState(true);
  const [showSuggestionArrows, setShowSuggestionArrows] = useState(true);
  const [engineThreads, setEngineThreads] = useState(2);
  const [engineMultiPv, setEngineMultiPv] = useState(3);
  const [engineDepth, setEngineDepth] = useState(AI_LEVELS[DEFAULT_AI_LEVEL].depth);
  const runningFenRef = useRef<string | null>(null);

  const aiColor: Color = playerColor === 'w' ? 'b' : 'w';
  const levelConfig: AiDifficultyConfig = AI_LEVELS[level];

  const refreshAnalysis = useCallback(
    (fen: string) => {
      if (!enabled || game.isGameOver) {
        engine.cancelCurrentSearch();
        return;
      }

      runningFenRef.current = fen;
      void engine.search({
        fen,
        depth: engineDepth,
        moveTimeMs: levelConfig.moveTimeMs,
        skillLevel: levelConfig.skillLevel,
        threads: engineThreads,
        multiPv: engineMultiPv
      }).then((result) => {
        if (!result || runningFenRef.current !== fen) return;

        const turn = (fen.split(' ')[1] === 'b' ? 'b' : 'w') as Color;
        if (turn === aiColor && result.bestMove) {
          game.playLanMove(result.bestMove);
        }
      });
    },
    [aiColor, enabled, engine, engineDepth, engineMultiPv, engineThreads, game, levelConfig.moveTimeMs, levelConfig.skillLevel]
  );

  useEffect(() => {
    setEngineDepth(levelConfig.depth);
  }, [levelConfig.depth]);

  useEffect(() => {
    refreshAnalysis(game.fen);
  }, [game.fen, refreshAnalysis]);


  const handleSquareAction = useCallback(
    (square: Square) => {
      if (!enabled) {
        game.handleSquareAction(square);
        return;
      }

      if (game.turn !== playerColor || game.isGameOver) return;
      game.handleSquareAction(square);
    },
    [enabled, game, playerColor]
  );

  const handlePiecePointer = useCallback(
    (square: Square) => {
      if (!enabled) return game.setFromPiecePointer(square);
      if (game.turn !== playerColor || game.isGameOver) return false;
      return game.setFromPiecePointer(square);
    },
    [enabled, game, playerColor]
  );

  const requestPlayerMove = useCallback(
    (from: Square, to: Square) => {
      if (!enabled) {
        game.requestMove(from, to);
        return;
      }

      if (game.turn !== playerColor || game.isGameOver) return;
      engine.cancelCurrentSearch();
      game.requestMove(from, to);
    },
    [enabled, engine, game, playerColor]
  );

  const resetVsAi = useCallback(() => {
    engine.cancelCurrentSearch();
    game.reset();
  }, [engine, game]);

  const startNewAiGame = useCallback(
    (color: Color = playerColor) => {
      setPlayerColor(color);
      engine.cancelCurrentSearch();
      game.reset();
      game.setOrientation(color);
    },
    [engine, game, playerColor]
  );

  const bestMoveLabel = useMemo(() => {
    if (!showBestMove) return 'Masqué';
    return engine.output.bestMove ?? '—';
  }, [engine.output.bestMove, showBestMove]);

  return {
    game,
    engine,
    enabled,
    setEnabled,
    playerColor,
    setPlayerColor,
    aiColor,
    level,
    levelConfig,
    setLevel,
    engineDepth,
    setEngineDepth,
    engineThreads,
    setEngineThreads,
    engineMultiPv,
    setEngineMultiPv,
    showBestMove,
    setShowBestMove,
    showThreats,
    setShowThreats,
    showSuggestionArrows,
    setShowSuggestionArrows,
    handleSquareAction,
    handlePiecePointer,
    requestPlayerMove,
    resetVsAi,
    startNewAiGame,
    bestMoveLabel,
    levels: Object.values(AI_LEVELS)
  };
}
