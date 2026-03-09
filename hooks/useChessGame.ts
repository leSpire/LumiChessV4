'use client';

import { useMemo, useState } from 'react';
import { Chess, type Color, type Move, type PieceSymbol, type Square } from 'chess.js';
import { boardMatrixToPieces, findKingSquare } from '@/lib/chessboard';
import type { BoardOrientation, LastMove, MoveHistoryEntry, PromotionDialogState } from '@/types/chess';

function createGame(fen?: string) {
  return fen ? new Chess(fen) : new Chess();
}

export function useChessGame(initialFen?: string) {
  const [game, setGame] = useState(() => createGame(initialFen));
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [orientation, setOrientation] = useState<BoardOrientation>('w');
  const [pendingPromotion, setPendingPromotion] = useState<PromotionDialogState | null>(null);
  const [lastMove, setLastMove] = useState<LastMove | null>(null);

  const legalTargets = useMemo(() => {
    if (!selectedSquare) return [];
    const moves = game.moves({ square: selectedSquare, verbose: true });
    return moves.map((move) => move.to);
  }, [game, selectedSquare]);

  const pieces = useMemo(() => boardMatrixToPieces(game.board()), [game]);

  const checkSquare = useMemo(() => {
    if (!game.inCheck()) return null;
    return findKingSquare(pieces, game.turn());
  }, [game, pieces]);

  const history = useMemo<MoveHistoryEntry[]>(() => {
    const verboseMoves = game.history({ verbose: true });
    const rows: MoveHistoryEntry[] = [];

    for (let i = 0; i < verboseMoves.length; i += 2) {
      rows.push({
        moveNumber: Math.floor(i / 2) + 1,
        white: verboseMoves[i],
        black: verboseMoves[i + 1]
      });
    }

    return rows;
  }, [game]);

  const tryMove = (from: Square, to: Square, promotion?: PieceSymbol) => {
    const result = game.move({ from, to, promotion });
    if (!result) return null;

    setGame(new Chess(game.fen()));
    setLastMove({ from, to });
    setSelectedSquare(null);

    return result;
  };

  const requestMove = (from: Square, to: Square) => {
    const needsPromotion = game
      .moves({ square: from, verbose: true })
      .some((move) => move.to === to && move.promotion);

    if (needsPromotion) {
      const movingPiece = game.get(from);
      if (!movingPiece) return false;
      setPendingPromotion({ from, to, color: movingPiece.color });
      return true;
    }

    const move = tryMove(from, to);
    return Boolean(move);
  };

  const handlePromotion = (piece: PieceSymbol) => {
    if (!pendingPromotion) return;
    tryMove(pendingPromotion.from, pendingPromotion.to, piece);
    setPendingPromotion(null);
  };

  const handleSquareAction = (square: Square) => {
    if (!selectedSquare) {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
      }
      return;
    }

    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    const selectedPiece = game.get(selectedSquare);
    const targetPiece = game.get(square);

    if (targetPiece && selectedPiece && targetPiece.color === selectedPiece.color) {
      if (selectedPiece.color === game.turn()) {
        setSelectedSquare(square);
      }
      return;
    }

    const moved = requestMove(selectedSquare, square);
    if (!moved) {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
      }
    }
  };

  const setFromPiecePointer = (square: Square) => {
    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      return true;
    }
    return false;
  };

  const reset = () => {
    const next = new Chess();
    setGame(next);
    setSelectedSquare(null);
    setPendingPromotion(null);
    setLastMove(null);
  };

  const status = useMemo(() => {
    if (game.isCheckmate()) {
      return `Échec et mat · ${game.turn() === 'w' ? 'Noirs' : 'Blancs'} gagnent`;
    }
    if (game.isStalemate()) return 'Pat';
    if (game.isDraw()) {
      if (game.isInsufficientMaterial()) return 'Nulle · Matériel insuffisant';
      if (game.isThreefoldRepetition()) return 'Nulle · Répétition';
      if (game.isDrawByFiftyMoves()) return 'Nulle · Règle des 50 coups';
      return 'Nulle';
    }
    return game.inCheck()
      ? `Échec · ${game.turn() === 'w' ? 'Blancs' : 'Noirs'} à jouer`
      : `${game.turn() === 'w' ? 'Blancs' : 'Noirs'} à jouer`;
  }, [game]);

  return {
    pieces,
    selectedSquare,
    legalTargets,
    lastMove,
    checkSquare,
    orientation,
    pendingPromotion,
    history,
    fen: game.fen(),
    pgn: game.pgn(),
    status,
    turn: game.turn() as Color,
    handleSquareAction,
    setFromPiecePointer,
    requestMove,
    setOrientation,
    handlePromotion,
    reset,
    loadFen: (fen: string) => {
      try {
        const next = new Chess(fen);
        setGame(next);
        setSelectedSquare(null);
        setPendingPromotion(null);
        setLastMove(null);
        return true;
      } catch {
        return false;
      }
    },
    loadPgn: (pgn: string) => {
      try {
        const next = new Chess();
        next.loadPgn(pgn);
        setGame(next);
        setSelectedSquare(null);
        setPendingPromotion(null);
        setLastMove(null);
        return true;
      } catch {
        return false;
      }
    }
  };
}
