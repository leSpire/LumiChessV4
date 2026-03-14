import type { ParsedLichessEvalLine } from '@/types/puzzle';

interface EvalPvLine {
  cp?: number;
  mate?: number;
  line?: string;
}

interface EvalDepthBlock {
  depth: number;
  pvs?: EvalPvLine[];
}

interface LichessEvalRecord {
  fen?: string;
  evals?: EvalDepthBlock[];
}

export function parseLichessEvalJsonl(content: string): ParsedLichessEvalLine[] {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      try {
        const parsed = JSON.parse(line) as LichessEvalRecord;
        if (!parsed.fen || !parsed.evals?.length) return [];

        const sorted = [...parsed.evals].sort((a, b) => b.depth - a.depth);
        const deepest = sorted[0];
        const bestPv = deepest.pvs?.[0];
        if (!bestPv?.line) return [];

        return [
          {
            fen: parsed.fen,
            maxDepth: deepest.depth,
            bestPv: bestPv.line.split(/\s+/).filter(Boolean),
            cp: bestPv.cp,
            mate: bestPv.mate
          } satisfies ParsedLichessEvalLine
        ];
      } catch {
        return [];
      }
    });
}
