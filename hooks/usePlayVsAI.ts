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
  const [mode, setMode] = useState<'play-vs-ai' | 'analysis' | 'puzzle'>('play-vs-ai');
  const [playerColor, setPlayerColor] = useState<Color>('w');
  const [level, setLevel] = useState<AiSkillLevel>(DEFAULT_AI_LEVEL);
  const [showBestMove, setShowBestMove] = useState(true);
  const [showThreats, setShowThreats] = useState(true);
  const [showSuggestionArrows, setShowSuggestionArrows] = useState(true);
  const [engineThreads, setEngineThreads] = useState(2);
  const [engineMultiPv, setEngineMultiPv] = useState(3);
  const [engineDepth, setEngineDepth] = useState(AI_LEVELS[DEFAULT_AI_LEVEL].depth);
  const runningFenRef = useRef<string | null>(null);
  const isPlayVsAiMode = mode === 'play-vs-ai';

  const aiColor: Color = playerColor === 'w' ? 'b' : 'w';
  const levelConfig: AiDifficultyConfig = AI_LEVELS[level];

  const refreshAnalysis = useCallback(
    (fen: string) => {
      if (game.isGameOver) {
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
        if (isPlayVsAiMode && turn === aiColor && result.bestMove) {
          game.playLanMove(result.bestMove);
        }
      });
    },
    [aiColor, engine, engineDepth, engineMultiPv, engineThreads, game, isPlayVsAiMode, levelConfig.moveTimeMs, levelConfig.skillLevel]
  );

  useEffect(() => {
    setEngineDepth(levelConfig.depth);
  }, [levelConfig.depth]);

  useEffect(() => {
    refreshAnalysis(game.fen);
  }, [game.fen, refreshAnalysis]);


  const handleSquareAction = useCallback(
    (square: Square) => {
      if (!isPlayVsAiMode) {
        game.handleSquareAction(square);
        return;
      }

      if (game.turn !== playerColor || game.isGameOver) return;
      game.handleSquareAction(square);
    },
    [game, isPlayVsAiMode, playerColor]
  );

  const handlePiecePointer = useCallback(
    (square: Square) => {
      if (!isPlayVsAiMode) return game.setFromPiecePointer(square);
      if (game.turn !== playerColor || game.isGameOver) return false;
      return game.setFromPiecePointer(square);
    },
    [game, isPlayVsAiMode, playerColor]
  );

  const requestPlayerMove = useCallback(
    (from: Square, to: Square) => {
      if (!isPlayVsAiMode) {
        game.requestMove(from, to);
        return;
      }

      if (game.turn !== playerColor || game.isGameOver) return;
      engine.cancelCurrentSearch();
      game.requestMove(from, to);
    },
    [engine, game, isPlayVsAiMode, playerColor]
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
    mode,
    setMode,
    isPlayVsAiMode,
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
