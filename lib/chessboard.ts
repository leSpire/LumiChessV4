import type { Color, PieceSymbol, Square } from 'chess.js';
import type { BoardOrientation, PieceOnBoard, SquarePosition } from '@/types/chess';

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;

export function squareToCoords(square: Square): SquarePosition {
  return {
    file: FILES.indexOf(square[0] as (typeof FILES)[number]),
    rank: RANKS.indexOf(square[1] as (typeof RANKS)[number])
  };
}

export function coordsToSquare(file: number, rank: number): Square {
  return `${FILES[file]}${RANKS[rank]}` as Square;
}

export function getDisplayFiles(orientation: BoardOrientation) {
  return orientation === 'w' ? [...FILES] : [...FILES].reverse();
}

export function getDisplayRanks(orientation: BoardOrientation) {
  return orientation === 'w' ? [...RANKS].reverse() : [...RANKS];
}

export function isLightSquare(square: Square): boolean {
  const { file, rank } = squareToCoords(square);
  return (file + rank) % 2 !== 0;
}

export function indexToSquare(index: number, orientation: BoardOrientation): Square {
  const row = Math.floor(index / 8);
  const col = index % 8;
  const file = orientation === 'w' ? col : 7 - col;
  const rank = orientation === 'w' ? 7 - row : row;
  return coordsToSquare(file, rank);
}

export function boardMatrixToPieces(board: ({ square: Square; type: PieceSymbol; color: Color } | null)[][]): PieceOnBoard[] {
  const pieces: PieceOnBoard[] = [];

  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board[row].length; col += 1) {
      const piece = board[row][col];
      if (!piece) continue;
      pieces.push({
        square: piece.square,
        color: piece.color,
        type: piece.type
      });
    }
  }

  return pieces;
}

export function findKingSquare(pieces: PieceOnBoard[], color: Color): Square | null {
  return pieces.find((piece) => piece.type === 'k' && piece.color === color)?.square ?? null;
}
