import { useState } from 'react';

interface PuzzleFiltersProps {
  onApplyRating: (min?: number, max?: number) => void;
}

export function PuzzleFilters({ onApplyRating }: PuzzleFiltersProps) {
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');

  return (
    <section className="space-y-2 rounded-xl border border-[#c6933d30] bg-[#100d09d0] p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-[#d8b77b]">Filtres</p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <input
          value={min}
          onChange={(event) => setMin(event.target.value)}
          placeholder="Elo min"
          className="rounded border border-[#c6933d42] bg-[#0c0907] px-2 py-1"
        />
        <input
          value={max}
          onChange={(event) => setMax(event.target.value)}
          placeholder="Elo max"
          className="rounded border border-[#c6933d42] bg-[#0c0907] px-2 py-1"
        />
      </div>
      <button
        type="button"
        onClick={() => onApplyRating(min ? Number(min) : undefined, max ? Number(max) : undefined)}
        className="rounded border border-[#d9b36c80] px-2 py-1 text-xs hover:bg-[#d9ab5d2f]"
      >
        Appliquer
      </button>
    </section>
  );
}
