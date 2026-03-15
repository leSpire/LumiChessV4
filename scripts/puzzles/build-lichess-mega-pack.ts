import { readFileSync, writeFileSync } from 'node:fs';
import { parseLichessPuzzleCsv } from '@/lib/puzzles/importers/lichessPuzzleCsv';
import { validatePuzzlePack } from '@/lib/puzzles/validators/validatePuzzlePack';
import type { PuzzleRecord } from '@/types/puzzle';

type Motif = 'mate' | 'sacrifice' | 'material';

interface Args {
  input: string;
  output: string;
  perBucket: number;
}

const ELO_BUCKETS = [
  { min: 0, max: 999 },
  { min: 1000, max: 1399 },
  { min: 1400, max: 1799 },
  { min: 1800, max: 2199 },
  { min: 2200, max: 4000 }
] as const;

function parseArgs(): Args {
  const [, , input, outputArg, perBucketArg] = process.argv;
  if (!input) {
    throw new Error(
      'Usage: ts-node scripts/puzzles/build-lichess-mega-pack.ts <lichess.csv> [output.json] [perBucket=60]'
    );
  }

  const perBucket = Number(perBucketArg ?? 60);
  return {
    input,
    output: outputArg ?? 'data/puzzles/dev-pack.json',
    perBucket: Number.isFinite(perBucket) && perBucket > 0 ? perBucket : 60
  };
}

function getMotifs(puzzle: PuzzleRecord): Motif[] {
  const raw = String(puzzle.metadata.rawThemes ?? '').toLowerCase();
  const motifs = new Set<Motif>();

  if (raw.includes('mate') || puzzle.objective === 'mate') motifs.add('mate');
  if (raw.includes('sacrifice')) motifs.add('sacrifice');

  if (
    puzzle.objective === 'materialGain' ||
    raw.includes('advantage') ||
    raw.includes('hangingpiece') ||
    raw.includes('capturingdefender') ||
    raw.includes('intermezzo')
  ) {
    motifs.add('material');
  }

  return [...motifs];
}

function chooseBalancedPack(puzzles: PuzzleRecord[], perBucket: number): PuzzleRecord[] {
  const selected: PuzzleRecord[] = [];
  const selectedIds = new Set<string>();

  for (const bucket of ELO_BUCKETS) {
    const inBucket = puzzles
      .filter((puzzle) => puzzle.rating >= bucket.min && puzzle.rating <= bucket.max)
      .sort((a, b) => b.popularity - a.popularity);

    for (const motif of ['mate', 'sacrifice', 'material'] as const) {
      const scoped = inBucket.filter((puzzle) => getMotifs(puzzle).includes(motif));
      for (const puzzle of scoped) {
        if (selectedIds.has(puzzle.id)) continue;
        selected.push(puzzle);
        selectedIds.add(puzzle.id);
        if (selected.filter((item) => item.rating >= bucket.min && item.rating <= bucket.max && getMotifs(item).includes(motif)).length >= perBucket) {
          break;
        }
      }
    }
  }

  return selected.sort((a, b) => a.rating - b.rating);
}

function main() {
  const args = parseArgs();
  const csv = readFileSync(args.input, 'utf8');
  const imported = parseLichessPuzzleCsv(csv);
  const balanced = chooseBalancedPack(imported, args.perBucket);
  const validated = validatePuzzlePack(balanced);

  writeFileSync(args.output, JSON.stringify(validated.valid, null, 2));

  const invalidCount = validated.invalid.length;
  // eslint-disable-next-line no-console
  console.log(
    `Pack écrit: ${validated.valid.length} puzzles valides (${invalidCount} rejetés) vers ${args.output}.`
  );
}

main();
