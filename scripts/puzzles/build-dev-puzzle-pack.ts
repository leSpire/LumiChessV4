import { readFileSync, writeFileSync } from 'node:fs';
import { parseLichessPuzzleCsv } from '@/lib/puzzles/importers/lichessPuzzleCsv';
import { validatePuzzlePack } from '@/lib/puzzles/validators/validatePuzzlePack';
import type { PuzzleRecord } from '@/types/puzzle';

const RATING_WINDOWS = [
  { min: 0, max: 999 },
  { min: 1000, max: 1399 },
  { min: 1400, max: 1799 },
  { min: 1800, max: 2199 },
  { min: 2200, max: 4000 }
] as const;

function hasRawTheme(puzzle: PuzzleRecord, theme: string): boolean {
  return String(puzzle.metadata.rawThemes ?? '')
    .toLowerCase()
    .split(/\s+/)
    .includes(theme.toLowerCase());
}

function pickByThemeAndRating(puzzles: PuzzleRecord[], perWindow = 15): PuzzleRecord[] {
  const selected: PuzzleRecord[] = [];
  const ids = new Set<string>();

  for (const window of RATING_WINDOWS) {
    const scoped = puzzles.filter((puzzle) => puzzle.rating >= window.min && puzzle.rating <= window.max);

    const families = [
      scoped.filter((puzzle) => puzzle.objective === 'mate'),
      scoped.filter((puzzle) => hasRawTheme(puzzle, 'sacrifice')),
      scoped.filter((puzzle) => puzzle.objective === 'materialGain')
    ];

    for (const family of families) {
      for (const puzzle of family.sort((a, b) => b.popularity - a.popularity)) {
        if (ids.has(puzzle.id)) continue;
        ids.add(puzzle.id);
        selected.push(puzzle);
        if (selected.filter((pick) => pick.rating >= window.min && pick.rating <= window.max).length >= perWindow * families.length) {
          break;
        }
      }
    }
  }

  return selected;
}

function main() {
  const sourcePath = process.argv[2];
  const outputPath = process.argv[3] ?? 'data/puzzles/dev-pack.json';

  if (!sourcePath) {
    throw new Error('Usage: ts-node scripts/puzzles/build-dev-puzzle-pack.ts <lichess.csv> [output.json]');
  }

  const csv = readFileSync(sourcePath, 'utf8');
  const all = parseLichessPuzzleCsv(csv);
  const sampled = pickByThemeAndRating(all);
  const validated = validatePuzzlePack(sampled);

  writeFileSync(outputPath, JSON.stringify(validated.valid, null, 2));
  // eslint-disable-next-line no-console
  console.log(`Wrote ${validated.valid.length} puzzles to ${outputPath} (${validated.invalid.length} rejected).`);
}

main();
