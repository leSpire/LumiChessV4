import type { PuzzleRecord } from '@/types/puzzle';

interface PuzzleHeaderProps {
  puzzle: PuzzleRecord | null;
  index: number;
  total: number;
}

export function PuzzleHeader({ puzzle, index, total }: PuzzleHeaderProps) {
  if (!puzzle) {
    return <header><h2 className="text-xl font-semibold">Aucun puzzle sélectionné</h2></header>;
  }

  return (
    <header className="space-y-2">
      <p className="text-xs uppercase tracking-[0.18em] text-[#d8b77b]">Puzzle {Math.max(index + 1, 1)} / {total}</p>
      <h2 className="text-xl font-semibold text-[#f4e5c6]">{puzzle.title}</h2>
      <p className="text-sm text-[#ccb897]">{puzzle.description}</p>
      <div className="flex flex-wrap gap-2 text-xs text-[#e7d0a3]">
        <span className="rounded-full border border-[#c6933d4f] px-2 py-1">Catégorie: {puzzle.category}</span>
        <span className="rounded-full border border-[#c6933d4f] px-2 py-1">Objectif: {puzzle.objective}</span>
        <span className="rounded-full border border-[#c6933d4f] px-2 py-1">Difficulté: {puzzle.rating}</span>
        <span className="rounded-full border border-[#c6933d4f] px-2 py-1">Thèmes: {puzzle.themes.join(', ')}</span>
      </div>
    </header>
  );
}
