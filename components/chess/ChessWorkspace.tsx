'use client';

import { useEffect, useState } from 'react';
import { ChessBoard } from '@/components/chess/ChessBoard';
import { PromotionDialog } from '@/components/chess/PromotionDialog';
import { SidePanel } from '@/components/chess/SidePanel';
import { useChessGame } from '@/hooks/useChessGame';

export function ChessWorkspace() {
  const game = useChessGame();
  const [pieceTheme, setPieceTheme] = useState('classic');

  useEffect(() => {
    const saved = window.localStorage.getItem('lumichess-piece-theme');
    if (saved) setPieceTheme(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem('lumichess-piece-theme', pieceTheme);
  }, [pieceTheme]);

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
          onSquareClick={game.handleSquareAction}
          onPiecePointerDown={game.setFromPiecePointer}
          onPieceDrop={game.requestMove}
          pieceTheme={pieceTheme}
        />
        {game.pendingPromotion && <PromotionDialog color={game.pendingPromotion.color} onSelect={game.handlePromotion} />}
      </div>

      <SidePanel
        status={game.status}
        fen={game.fen}
        pgn={game.pgn}
        history={game.history}
        onReset={game.reset}
        onToggleOrientation={() => game.setOrientation(game.orientation === 'w' ? 'b' : 'w')}
        onLoadFen={game.loadFen}
        onLoadPgn={game.loadPgn}
        pieceTheme={pieceTheme}
        onPieceThemeChange={setPieceTheme}
      />
    </section>
  );
}
