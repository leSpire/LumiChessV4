import { Chess } from 'chess.js';
import { buildPuzzleTitle, classifyPrimaryCategory, mapLichessThemes } from '@/lib/puzzles/classifiers/classifyPuzzle';
import type { CanonicalPuzzle, LichessPuzzleCsvRow } from '@/types/puzzle';

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

export function parseLichessPuzzleCsv(csvContent: string): CanonicalPuzzle[] {
  const lines = csvContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return [];

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).flatMap((line) => {
    const values = parseCsvLine(line);
    const row = headers.reduce<Record<string, string>>((acc, header, index) => {
      acc[header] = values[index] ?? '';
      return acc;
    }, {}) as unknown as LichessPuzzleCsvRow;

    const solutionLineUci = (row.Moves ?? '')
      .split(/\s+/)
      .map((move) => move.trim().toLowerCase())
      .filter(Boolean);

    if (!row.PuzzleId || !row.FEN || !solutionLineUci.length) return [];

    let turn: 'w' | 'b' = 'w';
    try {
      turn = new Chess(row.FEN).turn();
    } catch {
      return [];
    }

    const themes = mapLichessThemes(row.Themes ?? '');
    const rating = Number(row.Rating || 0);
    const popularity = Number(row.Popularity || row.NbPlays || 0);
    const openingTags = (row.OpeningTags ?? '').split(/[\s,]+/).filter(Boolean);

    const canonical: CanonicalPuzzle = {
      id: row.PuzzleId,
      startFen: row.FEN,
      initialPlayerToMove: turn,
      solutionLineUci,
      rating: Number.isFinite(rating) ? rating : 0,
      popularity: Number.isFinite(popularity) ? popularity : 0,
      themes,
      category: classifyPrimaryCategory(themes),
      sourceGameUrl: row.GameUrl,
      openingTags,
      explanation: undefined,
      metadata: {
        ratingDeviation: Number(row.RatingDeviation || 0),
        lichessThemesRaw: row.Themes ?? '',
        generatedAt: new Date().toISOString()
      },
      sourceType: 'lichess-puzzle'
    };

    return [canonical];
  });
}

export function toCsvRow(puzzle: CanonicalPuzzle): string {
  return [
    puzzle.id,
    puzzle.startFen,
    puzzle.solutionLineUci.join(' '),
    String(puzzle.rating),
    String(puzzle.popularity),
    puzzle.themes.join(' '),
    puzzle.sourceGameUrl ?? '',
    puzzle.openingTags.join(' ')
  ].join(',');
}
