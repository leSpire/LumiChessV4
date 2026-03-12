import type { Color } from 'chess.js';

export type PuzzleCategoryId =
  | 'mateIn1'
  | 'mateIn2'
  | 'fork'
  | 'pin'
  | 'doubleAttack'
  | 'deflection'
  | 'attraction'
  | 'discoveredAttack'
  | 'endgameTactic';

export interface PuzzleCategory {
  id: PuzzleCategoryId;
  label: string;
  description: string;
}

export type PuzzleMoveRole = 'player' | 'opponent';

export interface PuzzleMove {
  uci: string;
  san?: string;
  role: PuzzleMoveRole;
  comment?: string;
}

export interface Puzzle {
  id: string;
  title: string;
  description: string;
  category: PuzzleCategoryId;
  themes: PuzzleCategoryId[];
  rating: number;
  startFen: string;
  sideToMove: Color;
  orientation?: Color;
  solution: PuzzleMove[];
  explanation?: string;
  source?: string;
}

export type PuzzleStatus = 'idle' | 'ready' | 'in_progress' | 'failed' | 'solved';

export interface PuzzleProgress {
  currentPly: number;
  totalPly: number;
  completedPlayerMoves: number;
  totalPlayerMoves: number;
  completionRatio: number;
}

export interface PuzzleSessionState {
  activePuzzleId: string | null;
  activeCategory: PuzzleCategoryId | 'all';
  status: PuzzleStatus;
  currentMoveIndex: number;
  errors: number;
  feedback: string;
  playedMoves: string[];
  isBusy: boolean;
}

export interface PuzzleCatalogValidationIssue {
  puzzleId: string;
  reason: string;
}
