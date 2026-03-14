import { PuzzleCategoryTabs } from '@/components/puzzles/PuzzleCategoryTabs';
import { PuzzleFilters } from '@/components/puzzles/PuzzleFilters';
import { PuzzleList } from '@/components/puzzles/PuzzleList';
import type { CanonicalPuzzle, PuzzleCategoryDefinition, PuzzleProgress, PuzzleSessionState, PuzzleUiCategory } from '@/types/puzzle';

interface PuzzleSidebarProps {
  categories: PuzzleCategoryDefinition[];
  activeCategory: PuzzleUiCategory;
  filteredPuzzles: CanonicalPuzzle[];
  activePuzzle: CanonicalPuzzle | null;
  activePuzzleIndex: number;
  session: PuzzleSessionState;
  progress: PuzzleProgress;
  onCategorySelect: (category: PuzzleUiCategory) => void;
  onPuzzleSelect: (puzzleId: string) => void;
  onApplyRatingRange: (min?: number, max?: number) => void;
}

export function PuzzleSidebar({
  categories,
  activeCategory,
  filteredPuzzles,
  activePuzzle,
  activePuzzleIndex,
  session,
  progress,
  onCategorySelect,
  onPuzzleSelect,
  onApplyRatingRange
}: PuzzleSidebarProps) {
  return (
    <section className="space-y-3">
      <PuzzleCategoryTabs categories={categories} activeCategory={activeCategory} onSelect={onCategorySelect} />
      <PuzzleFilters onApplyRating={onApplyRatingRange} />

      <div className="grid grid-cols-2 gap-2 text-xs text-[#d5c3a7]">
        <div className="rounded-xl border border-[#c6933d33] bg-[#0f0c09] p-2">Statut: <strong>{session.status}</strong></div>
        <div className="rounded-xl border border-[#c6933d33] bg-[#0f0c09] p-2">Difficulté: <strong>{activePuzzle?.rating ?? '—'}</strong></div>
        <div className="rounded-xl border border-[#c6933d33] bg-[#0f0c09] p-2">Thèmes: <strong>{activePuzzle?.themes.length ?? 0}</strong></div>
        <div className="rounded-xl border border-[#c6933d33] bg-[#0f0c09] p-2">Progression: <strong>{progress.currentPly}/{progress.totalPly}</strong></div>
      </div>

      <p className="rounded-xl border border-[#c6933d33] bg-[#100d09] p-3 text-sm text-[#f3dfbd]">{session.feedback}</p>

      <p className="text-xs text-[#cbb89a]">
        {filteredPuzzles.length ? `Puzzle ${Math.max(0, activePuzzleIndex + 1)} / ${filteredPuzzles.length}` : 'Aucun puzzle chargé'}
      </p>
      <PuzzleList puzzles={filteredPuzzles} activePuzzleId={session.activePuzzleId} onSelect={onPuzzleSelect} />
    </section>
  );
}
