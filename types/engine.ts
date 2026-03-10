import type { Color } from 'chess.js';

export type EngineStatus = 'idle' | 'initializing' | 'ready' | 'thinking' | 'stopped' | 'error';

export type EngineScoreType = 'cp' | 'mate';

export interface EngineEvaluation {
  type: EngineScoreType;
  value: number;
  perspective: Color;
}

export interface EnginePrincipalVariation {
  moves: string[];
  line: string;
}

export interface EngineSearchSnapshot {
  depth: number;
  seldepth?: number;
  multipv?: number;
  nodes?: number;
  nps?: number;
  time?: number;
  bestMove?: string;
  evaluation?: EngineEvaluation;
  pv?: EnginePrincipalVariation;
}

export interface EngineOutput extends EngineSearchSnapshot {
  fen: string;
}

export type AiSkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'custom';

export interface AiDifficultyConfig {
  id: AiSkillLevel;
  label: string;
  description: string;
  depth: number;
  moveTimeMs: number;
  skillLevel: number;
}

export interface EngineRequestOptions {
  fen: string;
  depth: number;
  moveTimeMs: number;
  skillLevel: number;
}

export interface ParsedUciInfo extends Omit<EngineSearchSnapshot, 'bestMove'> {}
