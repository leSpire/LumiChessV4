import { readFileSync, writeFileSync } from 'node:fs';
import { parseLichessPuzzleCsv } from '@/lib/puzzles/importers/lichessPuzzleCsv';

function main() {
  const sourcePath = process.argv[2];
  const outputPath = process.argv[3] ?? 'data/puzzles/dev-pack.json';

  if (!sourcePath) {
    throw new Error('Usage: ts-node scripts/puzzles/build-dev-puzzle-pack.ts <lichess.csv> [output.json]');
  }

  const csv = readFileSync(sourcePath, 'utf8');
  const all = parseLichessPuzzleCsv(csv);
  const sample = all.slice(0, 200);
  writeFileSync(outputPath, JSON.stringify(sample, null, 2));
  // eslint-disable-next-line no-console
  console.log(`Wrote ${sample.length} puzzles to ${outputPath}`);
}

main();
