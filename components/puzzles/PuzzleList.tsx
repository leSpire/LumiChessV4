import clsx from 'clsx';
import type { CanonicalPuzzle } from '@/types/puzzle';

interface PuzzleListProps {
  puzzles: CanonicalPuzzle[];
  activePuzzleId: string | null;
  onSelect: (puzzleId: string) => void;
}

export function PuzzleList({ puzzles, activePuzzleId, onSelect }: PuzzleListProps) {
  if (!puzzles.length) {
    return <p className="rounded-xl border border-[#c6933d2f] bg-[#120f0be0] p-3 text-sm text-[#c7b496]">Aucun puzzle pour ces filtres.</p>;
  }

  return (
    <div className="max-h-64 space-y-2 overflow-auto pr-1">
      {puzzles.map((puzzle) => (
        <button
          key={puzzle.id}
          type="button"
          onClick={() => onSelect(puzzle.id)}
          className={clsx(
            'w-full rounded-xl border px-3 py-2 text-left transition',
            puzzle.id === activePuzzleId
              ? 'border-[#d9b36c] bg-[#d9ab5d1d]'
              : 'border-[#c6933d30] bg-[#100d09d0] hover:bg-[#d9ab5d12]'
          )}
        >
          <p className="text-sm font-medium text-[#f5e4c2]">{puzzle.id}</p>
          <p className="text-xs text-[#cbb89a]">{puzzle.rating} · {puzzle.category} · {puzzle.themes.join(', ')}</p>
        </button>
      ))}
    </div>
  );
}
