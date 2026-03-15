interface PuzzleActionsProps {
  canGoNext: boolean;
  canRetry: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onReset: () => void;
  onRetry: () => void;
  onHint: () => void;
}

export function PuzzleActions({ canGoNext, canRetry, onPrevious, onNext, onReset, onRetry, onHint }: PuzzleActionsProps) {
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      <button type="button" onClick={onPrevious} className="rounded-lg border border-[#c6933d4f] px-3 py-1.5 hover:bg-[#d9ab5d1a]">Précédent</button>
      <button type="button" onClick={onNext} className="rounded-lg border border-[#d9b36c] bg-[#d9ab5d2f] px-3 py-1.5 hover:bg-[#d9ab5d40] disabled:opacity-50" disabled={!canGoNext}>Puzzle suivant</button>
      <button type="button" onClick={onReset} className="rounded-lg border border-[#c6933d4f] px-3 py-1.5 hover:bg-[#d9ab5d1a]">Reset</button>
      <button type="button" onClick={onRetry} className="rounded-lg border border-[#c6933d4f] px-3 py-1.5 hover:bg-[#d9ab5d1a] disabled:opacity-50" disabled={!canRetry}>Réessayer</button>
      <button type="button" onClick={onHint} className="rounded-lg border border-[#d9b36c90] px-3 py-1.5 text-[#f4e4c5] hover:bg-[#d9ab5d2f]">Indice</button>
    </div>
  );
}
