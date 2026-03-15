import { Chess } from 'chess.js';
import type {
  LichessPuzzleCsvRow,
  PuzzleCategory,
  PuzzleObjective,
  PuzzleRecord,
  PuzzleSolutionMove,
  PuzzleTheme
} from '@/types/puzzle';

const LICHESS_THEME_MAP: Record<string, PuzzleTheme | undefined> = {
  mateIn1: 'mateIn1',
  mateIn2: 'mateIn2',
  mateIn3: 'mateIn3',
  fork: 'fork',
  pin: 'pin',
  skewer: 'skewer',
  discoveredAttack: 'discoveredAttack',
  doubleAttack: 'doubleAttack',
  attraction: 'attraction',
  deflection: 'deflection',
  sacrifice: 'sacrifice',
  promotion: 'promotion',
  endgame: 'endgameTechnique'
};

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  fields.push(current);
  return fields;
}

function mapThemes(raw: string): PuzzleTheme[] {
  const themes = raw
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => LICHESS_THEME_MAP[token])
    .filter((theme): theme is PuzzleTheme => Boolean(theme));

  return [...new Set(themes)];
}

function classifyCategory(themes: PuzzleTheme[]): PuzzleCategory {
  if (themes.some((theme) => theme.startsWith('mateIn'))) return 'mate';
  if (themes.includes('endgameTechnique') || themes.includes('promotion')) return 'endgame';
  return 'tactic';
}

function inferObjective(themes: PuzzleTheme[]): PuzzleObjective {
  if (themes.some((theme) => theme.startsWith('mateIn'))) return 'mate';
  if (themes.includes('promotion')) return 'promotion';
  if (themes.includes('endgameTechnique')) return 'endgameTechnique';
  return 'materialGain';
}

function buildTitle(themes: PuzzleTheme[], rating: number): string {
  if (themes.includes('mateIn1')) return `Mat en 1 · ${rating}`;
  if (themes.includes('mateIn2')) return `Mat en 2 · ${rating}`;
  if (themes.includes('fork')) return `Tactique fourchette · ${rating}`;
  if (themes.includes('pin')) return `Tactique clouage · ${rating}`;
  if (themes.includes('sacrifice')) return `Sacrifice tactique · ${rating}`;
  return `Puzzle tactique · ${rating}`;
}

function createSolutionLine(fen: string, moves: string[]): PuzzleSolutionMove[] {
  const chess = new Chess(fen);
  return moves.map((uci) => {
    const actor = chess.turn();
    const played = chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });

    return {
      uci,
      actor,
      san: played?.san
    } satisfies PuzzleSolutionMove;
  });
}

export function importLichessPuzzleCsv(csvContent: string): PuzzleRecord[] {
  const lines = csvContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return [];

  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).flatMap((line) => {
    const fields = parseCsvLine(line);
    const row = headers.reduce<Record<string, string>>((acc, header, index) => {
      acc[header] = fields[index] ?? '';
      return acc;
    }, {}) as unknown as LichessPuzzleCsvRow;

    const rawMoves = row.Moves.split(/\s+/).map((move) => move.trim().toLowerCase()).filter(Boolean);
    if (!row.PuzzleId || !row.FEN || rawMoves.length < 2) return [];

    try {
      const chess = new Chess(row.FEN);
      const themes = mapThemes(row.Themes ?? '');
      const rating = Number(row.Rating || 0);
      const popularity = Number(row.Popularity || row.NbPlays || 0);

      return [
        {
          id: row.PuzzleId,
          title: buildTitle(themes, Number.isFinite(rating) ? rating : 1200),
          description: 'Puzzle importé depuis la base open data Lichess.',
          startFen: row.FEN,
          playerToMove: chess.turn(),
          orientation: chess.turn(),
          category: classifyCategory(themes),
          themes,
          objective: inferObjective(themes),
          rating: Number.isFinite(rating) ? rating : 1200,
          popularity: Number.isFinite(popularity) ? popularity : 0,
          solutionLine: createSolutionLine(row.FEN, rawMoves),
          explanation: undefined,
          source: 'Lichess puzzle database',
          sourceGameUrl: row.GameUrl,
          sourceType: 'lichess-open-database',
          validated: false,
          validationErrors: [],
          metadata: {
            openingTags: row.OpeningTags ?? '',
            rawThemes: row.Themes ?? ''
          }
        } satisfies PuzzleRecord
      ];
    } catch {
      return [];
    }
  });
}
