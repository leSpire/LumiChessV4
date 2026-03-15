import { readFileSync, writeFileSync } from 'node:fs';
import { parseLichessPuzzleCsv } from '@/lib/puzzles/importers/lichessPuzzleCsv';
import { validatePuzzlePack } from '@/lib/puzzles/validators/validatePuzzlePack';

function main() {
  const inputPath = process.argv[2];
  const outputPath = process.argv[3] ?? 'data/puzzles/lichess-import.json';

  if (!inputPath) {
    throw new Error('Usage: ts-node scripts/puzzles/import-lichess-puzzles.ts <input.csv> [output.json]');
  }

  const csv = readFileSync(inputPath, 'utf8');
  const parsed = parseLichessPuzzleCsv(csv);
  const validated = validatePuzzlePack(parsed);

  writeFileSync(outputPath, JSON.stringify(validated.valid, null, 2));
  // eslint-disable-next-line no-console
  console.log(`Imported ${validated.valid.length} puzzles, rejected ${validated.invalid.length}.`);
}

main();
