import type { Color, PieceSymbol, Square, Move } from 'chess.js';

export type BoardOrientation = Color;

export interface SquarePosition {
  file: number;
  rank: number;
}

export interface PieceOnBoard {
  square: Square;
  color: Color;
  type: PieceSymbol;
}

export interface LastMove {
  from: Square;
  to: Square;
}

export interface PromotionDialogState {
  from: Square;
  to: Square;
  color: Color;
}

export interface ChessBoardProps {
  orientation: BoardOrientation;
  selectedSquare: Square | null;
  legalTargets: Square[];
  inCheckSquare: Square | null;
  lastMove: LastMove | null;
  pieces: PieceOnBoard[];
  onSquareClick: (square: Square) => void;
  onPiecePointerDown: (square: Square) => void;
  onPieceDrop: (from: Square, to: Square) => void;
}

export interface GameStatus {
  label: string;
  value: string;
}

export interface MoveHistoryEntry {
  moveNumber: number;
  white?: Move;
  black?: Move;
}
