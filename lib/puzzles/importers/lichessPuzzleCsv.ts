import type { PuzzleRecord } from '@/types/puzzle';
import { importLichessPuzzleCsv } from '@/lib/puzzles/importers/lichessPuzzleImporter';

export function parseLichessPuzzleCsv(csvContent: string): PuzzleRecord[] {
  return importLichessPuzzleCsv(csvContent);
}

export function toCsvRow(puzzle: PuzzleRecord): string {
  return [
    puzzle.id,
    puzzle.startFen,
    puzzle.solutionLine.map((step) => step.uci).join(' '),
    String(puzzle.rating),
    String(puzzle.popularity),
    puzzle.themes.join(' '),
    puzzle.sourceGameUrl ?? ''
  ].join(',');
}
