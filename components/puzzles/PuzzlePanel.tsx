import { PuzzleActions } from '@/components/puzzles/PuzzleActions';
import { PuzzleHeader } from '@/components/puzzles/PuzzleHeader';
import { PuzzleSidebar } from '@/components/puzzles/PuzzleSidebar';
import { PuzzleStatusBanner } from '@/components/puzzles/PuzzleStatusBanner';
import type { PuzzleCategoryDefinition, PuzzleProgress, PuzzleRecord, PuzzleSessionState, PuzzleUiCategory } from '@/types/puzzle';

interface PuzzlePanelProps {
  categories: PuzzleCategoryDefinition[];
  filteredPuzzles: PuzzleRecord[];
  activePuzzle: PuzzleRecord | null;
  activePuzzleIndex: number;
  session: PuzzleSessionState;
  progress: PuzzleProgress;
  onCategorySelect: (category: PuzzleUiCategory) => void;
  onPuzzleSelect: (puzzleId: string) => void;
  onApplyRatingRange: (min?: number, max?: number) => void;
  onReset: () => void;
  onRetry: () => void;
  onNextPuzzle: () => void;
  onPreviousPuzzle: () => void;
  onRevealHint: () => void;
}

export function PuzzlePanel(props: PuzzlePanelProps) {
  return (
    <aside className="space-y-4 rounded-3xl border border-[#c6933d33] bg-gradient-to-b from-[#17120de8] to-[#0b0907ef] p-5 text-[#f2e0be] shadow-board">
      <PuzzleHeader puzzle={props.activePuzzle} index={props.activePuzzleIndex} total={props.filteredPuzzles.length} />
      <PuzzleStatusBanner session={props.session} />
      <PuzzleActions
        canGoNext={props.session.canGoNext || props.session.status === 'ready' || props.session.status === 'in_progress'}
        canRetry={props.session.canRetry}
        onPrevious={props.onPreviousPuzzle}
        onNext={props.onNextPuzzle}
        onReset={props.onReset}
        onRetry={props.onRetry}
        onHint={props.onRevealHint}
      />

      <PuzzleSidebar
        categories={props.categories}
        activeCategory={props.session.activeCategory}
        filteredPuzzles={props.filteredPuzzles}
        activePuzzleIndex={props.activePuzzleIndex}
        session={props.session}
        progress={props.progress}
        onCategorySelect={props.onCategorySelect}
        onPuzzleSelect={props.onPuzzleSelect}
        onApplyRatingRange={props.onApplyRatingRange}
      />
    </aside>
  );
}
