import { PuzzleCategoryTabs } from '@/components/puzzles/PuzzleCategoryTabs';
import { PuzzleList } from '@/components/puzzles/PuzzleList';
import type { Puzzle, PuzzleCategory, PuzzleProgress, PuzzleSessionState } from '@/types/puzzle';

interface PuzzlePanelProps {
  categories: PuzzleCategory[];
  filteredPuzzles: Puzzle[];
  activePuzzle: Puzzle | null;
  activePuzzleIndex: number;
  session: PuzzleSessionState;
  progress: PuzzleProgress;
  onCategorySelect: (category: PuzzleSessionState['activeCategory']) => void;
  onPuzzleSelect: (puzzleId: string) => void;
  onReset: () => void;
  onRetry: () => void;
  onNextPuzzle: () => void;
  onPreviousPuzzle: () => void;
  onRevealHint: () => void;
}

export function PuzzlePanel({
  categories,
  filteredPuzzles,
  activePuzzle,
  activePuzzleIndex,
  session,
  progress,
  onCategorySelect,
  onPuzzleSelect,
  onReset,
  onRetry,
  onNextPuzzle,
  onPreviousPuzzle,
  onRevealHint
}: PuzzlePanelProps) {
  return (
    <aside className="space-y-4 rounded-3xl border border-[#c6933d33] bg-gradient-to-b from-[#17120de8] to-[#0b0907ef] p-5 text-[#f2e0be] shadow-board">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-[#d8b77b]">Espace tactique</p>
        <h2 className="mt-1 text-xl font-semibold">{activePuzzle?.title ?? 'Aucun puzzle sélectionné'}</h2>
        <p className="mt-1 text-sm text-[#ccb897]">{activePuzzle?.description ?? 'Sélectionne une catégorie puis un puzzle.'}</p>
      </header>

      <PuzzleCategoryTabs categories={categories} activeCategory={session.activeCategory} onSelect={onCategorySelect} />

      <section className="grid grid-cols-2 gap-2 text-xs text-[#d5c3a7]">
        <div className="rounded-xl border border-[#c6933d33] bg-[#0f0c09] p-2">Statut: <strong>{session.status}</strong></div>
        <div className="rounded-xl border border-[#c6933d33] bg-[#0f0c09] p-2">Niveau: <strong>{activePuzzle?.rating ?? '—'}</strong></div>
        <div className="rounded-xl border border-[#c6933d33] bg-[#0f0c09] p-2">Catégorie: <strong>{activePuzzle?.category ?? '—'}</strong></div>
        <div className="rounded-xl border border-[#c6933d33] bg-[#0f0c09] p-2">Progression: <strong>{progress.currentPly}/{progress.totalPly}</strong></div>
      </section>

      <p className="rounded-xl border border-[#c6933d33] bg-[#100d09] p-3 text-sm text-[#f3dfbd]">{session.feedback}</p>

      <div className="flex flex-wrap gap-2 text-xs">
        <button type="button" onClick={onPreviousPuzzle} className="rounded-lg border border-[#c6933d4f] px-3 py-1.5 hover:bg-[#d9ab5d1a]">Précédent</button>
        <button type="button" onClick={onNextPuzzle} className="rounded-lg border border-[#c6933d4f] px-3 py-1.5 hover:bg-[#d9ab5d1a]">Suivant</button>
        <button type="button" onClick={onReset} className="rounded-lg border border-[#c6933d4f] px-3 py-1.5 hover:bg-[#d9ab5d1a]">Reset</button>
        <button type="button" onClick={onRetry} className="rounded-lg border border-[#c6933d4f] px-3 py-1.5 hover:bg-[#d9ab5d1a]">Retry</button>
        <button type="button" onClick={onRevealHint} className="rounded-lg border border-[#d9b36c90] px-3 py-1.5 text-[#f4e4c5] hover:bg-[#d9ab5d2f]">Indice</button>
      </div>

      <section>
        <p className="mb-2 text-xs uppercase tracking-[0.18em] text-[#d8b77b]">
          Liste des puzzles {filteredPuzzles.length ? `(${Math.max(0, activePuzzleIndex + 1)}/${filteredPuzzles.length})` : ''}
        </p>
        <PuzzleList puzzles={filteredPuzzles} activePuzzleId={session.activePuzzleId} onSelect={onPuzzleSelect} />
      </section>
    </aside>
  );
}
