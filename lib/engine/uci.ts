import type { Color } from 'chess.js';
import type { EngineEvaluation, ParsedUciInfo } from '@/types/engine';

const INFO_PREFIX = 'info ';

function readToken(tokens: string[], key: string): string | undefined {
  const index = tokens.indexOf(key);
  if (index < 0 || index + 1 >= tokens.length) return undefined;
  return tokens[index + 1];
}

function toNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseScore(tokens: string[], perspective: Color): EngineEvaluation | undefined {
  const scoreIndex = tokens.indexOf('score');
  if (scoreIndex < 0 || scoreIndex + 2 >= tokens.length) return undefined;

  const type = tokens[scoreIndex + 1];
  const rawValue = Number(tokens[scoreIndex + 2]);

  if (!Number.isFinite(rawValue)) return undefined;

  if (type === 'cp') {
    return {
      type: 'cp',
      value: perspective === 'w' ? rawValue : -rawValue,
      perspective
    };
  }

  if (type === 'mate') {
    return {
      type: 'mate',
      value: perspective === 'w' ? rawValue : -rawValue,
      perspective
    };
  }

  return undefined;
}

export function parseUciInfo(line: string, perspective: Color): ParsedUciInfo | null {
  if (!line.startsWith(INFO_PREFIX)) return null;

  const tokens = line.trim().split(/\s+/);
  const pvIndex = tokens.indexOf('pv');
  const pvMoves = pvIndex >= 0 ? tokens.slice(pvIndex + 1) : [];

  return {
    depth: toNumber(readToken(tokens, 'depth')) ?? 0,
    seldepth: toNumber(readToken(tokens, 'seldepth')),
    multipv: toNumber(readToken(tokens, 'multipv')),
    nodes: toNumber(readToken(tokens, 'nodes')),
    nps: toNumber(readToken(tokens, 'nps')),
    time: toNumber(readToken(tokens, 'time')),
    evaluation: parseScore(tokens, perspective),
    pv: pvMoves.length
      ? {
          moves: pvMoves,
          line: pvMoves.join(' ')
        }
      : undefined
  };
}

export function parseBestMove(line: string): string | null {
  if (!line.startsWith('bestmove')) return null;
  const [, move] = line.trim().split(/\s+/);
  if (!move || move === '(none)') return null;
  return move;
}

export function formatEvaluation(evaluation?: EngineEvaluation): string {
  if (!evaluation) return '—';
  if (evaluation.type === 'mate') {
    const prefix = evaluation.value > 0 ? '+' : '';
    return `#${prefix}${evaluation.value}`;
  }

  const pawns = evaluation.value / 100;
  const prefix = pawns > 0 ? '+' : '';
  return `${prefix}${pawns.toFixed(2)}`;
}
