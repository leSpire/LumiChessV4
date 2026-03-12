import type { Color } from 'chess.js';

export type PuzzleTheme =
  | 'mateIn1'
  | 'mateIn2'
  | 'fork'
  | 'pin'
  | 'doubleAttack'
  | 'deflection'
  | 'attraction'
  | 'discoveredAttack'
  | 'endgameTactic';

export type PuzzleMoveRole = 'player' | 'opponent';

export interface PuzzleMove {
  lan: string;
  san?: string;
  role: PuzzleMoveRole;
  comment?: string;
}

export interface Puzzle {
  id: string;
  title: string;
  description?: string;
  startFen: string;
  orientation?: Color;
  playerToMove: Color;
  themes: PuzzleTheme[];
  rating?: number;
  solution: PuzzleMove[];
  explanation?: string;
  source?: string;
  tags?: string[];
}

export type PuzzleStatus = 'idle' | 'ready' | 'in_progress' | 'failed' | 'solved';

export interface PuzzleProgress {
  currentMoveIndex: number;
  totalMoves: number;
  completedMoves: number;
  completionRatio: number;
}

export interface PuzzleAttemptState {
  status: PuzzleStatus;
  errors: number;
  maxErrors: number;
  feedback: string;
  playedMoves: string[];
  failedReason?: string;
}

export interface PuzzleResult {
  puzzleId: string;
  status: Extract<PuzzleStatus, 'failed' | 'solved'>;
  errors: number;
  playedMoves: string[];
}

export interface PuzzleSessionState {
  activePuzzle: Puzzle | null;
  status: PuzzleStatus;
  currentMoveIndex: number;
  errors: number;
  maxErrors: number;
  feedback: string;
  playedMoves: string[];
  result: PuzzleResult | null;
  isBusy: boolean;
}
