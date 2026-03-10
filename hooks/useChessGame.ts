'use client';

import { useMemo, useState } from 'react';
import { Chess, type Color, type PieceSymbol, type Square } from 'chess.js';
import { boardMatrixToPieces, findKingSquare } from '@/lib/chessboard';
import {
  applyMove,
  createInitialRecord,
  createRecordFromFen,
  createRecordFromPgn,
  exportPgn,
  navigateRecord,
  toHistoryRows
} from '@/lib/game/chessGameService';
import type { BoardOrientation, LastMove, MoveHistoryEntry, PromotionDialogState } from '@/types/chess';
import type { GameError } from '@/types/game';

export function useChessGame(initialFen?: string) {
  const [record, setRecord] = useState(() => createInitialRecord(initialFen));
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [orientation, setOrientation] = useState<BoardOrientation>('w');
  const [pendingPromotion, setPendingPromotion] = useState<PromotionDialogState | null>(null);
  const [lastMove, setLastMove] = useState<LastMove | null>(null);
  const [lastError, setLastError] = useState<GameError | null>(null);

  const game = useMemo(() => new Chess(record.currentFen), [record.currentFen]);

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

  const history = useMemo<MoveHistoryEntry[]>(() => toHistoryRows(record.moves), [record.moves]);

  const tryMove = (from: Square, to: Square, promotion?: PieceSymbol) => {
    const result = applyMove(record, { from, to, promotion });
    if (!result.ok || !result.data) {
      setLastError(result.error ?? null);
      return null;
    }

    setRecord(result.data);
    setLastMove({ from, to });
    setSelectedSquare(null);
    setLastError(null);

    return true;
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

    return Boolean(tryMove(from, to));
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

  const clearTransient = () => {
    setSelectedSquare(null);
    setPendingPromotion(null);
    setLastMove(null);
  };

  const reset = () => {
    setRecord(createInitialRecord());
    clearTransient();
    setLastError(null);
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

  const moveToIndex = (index: number) => {
    setRecord((current) => {
      const boundedIndex = Math.max(0, Math.min(index, current.positions.length - 1));
      return {
        ...current,
        currentIndex: boundedIndex,
        currentFen: current.positions[boundedIndex].fen
      };
    });
    clearTransient();
  };

  const navigate = (action: 'start' | 'prev' | 'next' | 'end') => {
    setRecord((current) => navigateRecord(current, action));
    clearTransient();
  };

  return {
    pieces,
    selectedSquare,
    legalTargets,
    lastMove,
    checkSquare,
    orientation,
    pendingPromotion,
    history,
    fen: record.currentFen,
    pgn: exportPgn(record),
    status,
    turn: game.turn() as Color,
    currentIndex: record.currentIndex,
    positionsCount: record.positions.length,
    metadata: record.metadata,
    lastError,
    handleSquareAction,
    setFromPiecePointer,
    requestMove,
    setOrientation,
    handlePromotion,
    reset,
    moveToIndex,
    navigate,
    loadFen: (fen: string) => {
      const result = createRecordFromFen(fen);
      if (!result.ok || !result.data) {
        setLastError(result.error ?? null);
        return result;
      }

      setRecord(result.data);
      clearTransient();
      setLastError(null);
      return result;
    },
    loadPgn: (pgn: string) => {
      const result = createRecordFromPgn(pgn);
      if (!result.ok || !result.data) {
        setLastError(result.error ?? null);
        return result;
      }

      setRecord(result.data);
      clearTransient();
      setLastError(null);
      return result;
    }
  };
}
