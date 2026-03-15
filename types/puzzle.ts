import type { Color } from 'chess.js';

export type PuzzleId = string;

export type PuzzleCategory = 'mate' | 'tactic' | 'endgame';

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
  | 'promotion'
  | 'endgameTechnique';

export type PuzzleObjective = 'mate' | 'materialGain' | 'promotion' | 'endgameTechnique';

export type PuzzleSourceType = 'lichess-open-database' | 'lichess-puzzler-inspired' | 'local-curated';

export type PuzzleUiCategory = 'all' | PuzzleCategory;

export interface PuzzleCategoryDefinition {
  id: PuzzleUiCategory;
  label: string;
  description: string;
}

export interface PuzzleSolutionMove {
  uci: string;
  actor: Color;
  san?: string;
}

export interface PuzzleRecord {
  id: PuzzleId;
  title: string;
  description: string;
  startFen: string;
  playerToMove: Color;
  orientation: Color;
  category: PuzzleCategory;
  themes: PuzzleTheme[];
  objective: PuzzleObjective;
  rating: number;
  popularity: number;
  solutionLine: PuzzleSolutionMove[];
  explanation?: string;
  source: string;
  sourceGameUrl?: string;
  sourceType: PuzzleSourceType;
  validated: boolean;
  validationErrors: string[];
  metadata: Record<string, string | number | boolean | null>;
}

export interface PuzzleValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface InvalidPuzzleReport {
  puzzleId: string;
  errors: string[];
  warnings: string[];
}

export interface PuzzlePackValidationResult {
  valid: PuzzleRecord[];
  invalid: InvalidPuzzleReport[];
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

export type PuzzleSessionStatus = 'idle' | 'loading' | 'ready' | 'in_progress' | 'solved' | 'failed' | 'invalid';

export type PuzzleCompletionState = 'none' | 'solved' | 'failed';

export interface PuzzleProgress {
  currentPly: number;
  totalPly: number;
  completionRatio: number;
}

export interface PuzzleSessionState {
  activePuzzleId: PuzzleId | null;
  status: PuzzleSessionStatus;
  completionState: PuzzleCompletionState;
  currentMoveIndex: number;
  errors: string[];
  feedback: string;
  playedMoves: string[];
  activeCategory: PuzzleUiCategory;
  canGoNext: boolean;
  canRetry: boolean;
  isBusy: boolean;
}

export interface PuzzleCatalogState {
  activeCategory: PuzzleUiCategory;
  activeThemes: PuzzleTheme[];
  ratingRange: {
    min?: number;
    max?: number;
  };
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
