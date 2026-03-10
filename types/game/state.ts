import type { Color, PieceSymbol, Square } from 'chess.js';

export type FenString = string;
export type PgnString = string;

export type GameErrorCode = 'INVALID_FEN' | 'INVALID_PGN' | 'INVALID_MOVE' | 'OUT_OF_RANGE';

export interface GameError {
  code: GameErrorCode;
  message: string;
  raw?: string;
}

export interface ServiceResult<T> {
  ok: boolean;
  data?: T;
  error?: GameError;
}

export interface PositionSnapshot {
  index: number;
  fen: FenString;
  turn: Color;
  halfmoveClock: number;
  fullmoveNumber: number;
}

export interface TimelineMove {
  ply: number;
  color: Color;
  from: Square;
  to: Square;
  san: string;
  lan: string;
  promotion?: PieceSymbol;
  fenAfter: FenString;
}

export interface MoveHistoryRow {
  moveNumber: number;
  white?: TimelineMove;
  black?: TimelineMove;
}

export interface PgnMetadata {
  Event?: string;
  Site?: string;
  Date?: string;
  Round?: string;
  White?: string;
  Black?: string;
  Result?: string;
  [key: string]: string | undefined;
}

export interface ImportedPosition {
  source: 'fen';
  fen: FenString;
}

export interface ImportedGame {
  source: 'pgn';
  pgn: PgnString;
  metadata: PgnMetadata;
}

export interface GameRecord {
  initialFen: FenString;
  currentFen: FenString;
  currentIndex: number;
  positions: PositionSnapshot[];
  moves: TimelineMove[];
  metadata: PgnMetadata;
}

export interface MoveInput {
  from: Square;
  to: Square;
  promotion?: PieceSymbol;
}
