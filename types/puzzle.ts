import type { Color } from 'chess.js';

export type PuzzleId = string;

export type PuzzleSourceType = 'lichess-puzzle' | 'lichess-generated' | 'local' | 'curated';

export type PuzzlePrimaryCategory =
  | 'mate'
  | 'tactics'
  | 'endgame'
  | 'promotion'
  | 'advantage'
  | 'mixed';

export type PuzzleTheme =
  | 'mateIn1'
  | 'mateIn2'
  | 'mateIn3'
  | 'fork'
  | 'pin'
  | 'skewer'
  | 'discoveredAttack'
  | 'doubleAttack'
  | 'attraction'
  | 'deflection'
  | 'sacrifice'
  | 'endgame'
  | 'promotion'
  | 'hangingPiece'
  | 'clearance'
  | 'xRay'
  | 'interference'
  | 'quietMove';

export type PuzzleUiCategory = 'all' | 'mate' | 'tactics' | 'endgame';

export interface PuzzleCategoryDefinition {
  id: PuzzleUiCategory;
  label: string;
  description: string;
}

export interface CanonicalPuzzle {
  id: PuzzleId;
  startFen: string;
  initialPlayerToMove: Color;
  solutionLineUci: string[];
  rating: number;
  popularity: number;
  themes: PuzzleTheme[];
  category: PuzzlePrimaryCategory;
  sourceGameUrl?: string;
  openingTags: string[];
  explanation?: string;
  metadata: Record<string, string | number | boolean | null>;
  sourceType: PuzzleSourceType;
}

export interface PuzzleRecord extends CanonicalPuzzle {
  title: string;
  shortDescription: string;
}

export interface PuzzleQuery {
  category?: PuzzleUiCategory;
  themes?: PuzzleTheme[];
  minRating?: number;
  maxRating?: number;
  limit?: number;
  offset?: number;
  sortBy?: 'rating' | 'popularity' | 'freshness';
}

export type PuzzleSessionStatus = 'idle' | 'ready' | 'in_progress' | 'failed' | 'solved';

export interface PuzzleProgress {
  currentPly: number;
  totalPly: number;
  completionRatio: number;
}

export interface PuzzleSessionState {
  activePuzzleId: PuzzleId | null;
  status: PuzzleSessionStatus;
  currentMoveIndex: number;
  errors: number;
  feedback: string;
  playedMoves: string[];
  activeCategory: PuzzleUiCategory;
  isBusy: boolean;
}

export interface PuzzleValidationIssue {
  puzzleId: string;
  reason: string;
}

export interface LichessPuzzleCsvRow {
  PuzzleId: string;
  FEN: string;
  Moves: string;
  Rating: string;
  RatingDeviation?: string;
  Popularity?: string;
  NbPlays?: string;
  Themes: string;
  GameUrl?: string;
  OpeningTags?: string;
}

export interface ParsedLichessEvalLine {
  fen: string;
  maxDepth: number;
  bestPv: string[];
  cp?: number;
  mate?: number;
}
