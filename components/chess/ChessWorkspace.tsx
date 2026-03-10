'use client';

import { useEffect, useState } from 'react';
import { ChessBoard } from '@/components/chess/ChessBoard';
import { PromotionDialog } from '@/components/chess/PromotionDialog';
import { SidePanel } from '@/components/chess/SidePanel';
import { usePlayVsAI } from '@/hooks/usePlayVsAI';

export function ChessWorkspace() {
  const ai = usePlayVsAI();
  const game = ai.game;
  const [pieceTheme, setPieceTheme] = useState('classic');
  const [boardTheme, setBoardTheme] = useState('lumi-classic');

  useEffect(() => {
    const savedPieceTheme = window.localStorage.getItem('lumichess-piece-theme');
    if (savedPieceTheme) setPieceTheme(savedPieceTheme);

    const savedBoardTheme = window.localStorage.getItem('lumichess-board-theme');
    if (savedBoardTheme) setBoardTheme(savedBoardTheme);
  }, []);

  useEffect(() => {
    window.localStorage.setItem('lumichess-piece-theme', pieceTheme);
  }, [pieceTheme]);

  useEffect(() => {
    window.localStorage.setItem('lumichess-board-theme', boardTheme);
  }, [boardTheme]);

  return (
    <section className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
      <div className="relative">
        <ChessBoard
          orientation={game.orientation}
          turn={game.turn}
          selectedSquare={game.selectedSquare}
          legalTargets={game.legalTargets}
          inCheckSquare={game.checkSquare}
          lastMove={game.lastMove}
          pieces={game.pieces}
          onSquareClick={ai.handleSquareAction}
          onPiecePointerDown={ai.handlePiecePointer}
          onPieceDrop={ai.requestPlayerMove}
          pieceTheme={pieceTheme}
          boardTheme={boardTheme}
        />
        {game.pendingPromotion && <PromotionDialog color={game.pendingPromotion.color} onSelect={game.handlePromotion} />}
      </div>

      <SidePanel
        status={game.status}
        fen={game.fen}
        pgn={game.pgn}
        history={game.history}
        currentIndex={game.currentIndex}
        positionsCount={game.positionsCount}
        metadata={game.metadata}
        error={game.lastError}
        onReset={game.reset}
        onToggleOrientation={() => game.setOrientation(game.orientation === 'w' ? 'b' : 'w')}
        onLoadFen={game.loadFen}
        onLoadPgn={game.loadPgn}
        onNavigate={game.navigate}
        onMoveToIndex={game.moveToIndex}
        pieceTheme={pieceTheme}
        onPieceThemeChange={setPieceTheme}
        boardTheme={boardTheme}
        onBoardThemeChange={setBoardTheme}
        aiEnabled={ai.enabled}
        playerColor={ai.playerColor}
        aiLevel={ai.level}
        aiLevels={ai.levels}
        engineStatus={ai.engine.status}
        engineError={ai.engine.error}
        engineOutput={ai.engine.output}
        bestMoveLabel={ai.bestMoveLabel}
        showBestMove={ai.showBestMove}
        onToggleAiEnabled={ai.setEnabled}
        onPlayerColorChange={(color) => {
          ai.setPlayerColor(color);
          game.setOrientation(color);
        }}
        onAiLevelChange={(value) => ai.setLevel(value as typeof ai.level)}
        onNewAiGame={() => ai.startNewAiGame(ai.playerColor)}
        onResetAi={ai.resetVsAi}
        onToggleBestMove={ai.setShowBestMove}
      />
    </section>
  );
}
