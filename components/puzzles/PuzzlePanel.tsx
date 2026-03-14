import { PuzzleSidebar } from '@/components/puzzles/PuzzleSidebar';
import type { CanonicalPuzzle, PuzzleCategoryDefinition, PuzzleProgress, PuzzleSessionState, PuzzleUiCategory } from '@/types/puzzle';

interface PuzzlePanelProps {
  categories: PuzzleCategoryDefinition[];
  filteredPuzzles: CanonicalPuzzle[];
  activePuzzle: CanonicalPuzzle | null;
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
  const { activePuzzle } = props;

  return (
    <aside className="space-y-4 rounded-3xl border border-[#c6933d33] bg-gradient-to-b from-[#17120de8] to-[#0b0907ef] p-5 text-[#f2e0be] shadow-board">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-[#d8b77b]">Espace puzzles</p>
        <h2 className="mt-1 text-xl font-semibold">{activePuzzle ? activePuzzle.id : 'Aucun puzzle sélectionné'}</h2>
        <p className="mt-1 text-sm text-[#ccb897]">
          {activePuzzle?.explanation ?? 'Dataset Lichess importé dans le format canonique LumiChess.'}
        </p>
      </header>

      <div className="flex flex-wrap gap-2 text-xs">
        <button type="button" onClick={props.onPreviousPuzzle} className="rounded-lg border border-[#c6933d4f] px-3 py-1.5 hover:bg-[#d9ab5d1a]">Précédent</button>
        <button type="button" onClick={props.onNextPuzzle} className="rounded-lg border border-[#c6933d4f] px-3 py-1.5 hover:bg-[#d9ab5d1a]">Suivant</button>
        <button type="button" onClick={props.onReset} className="rounded-lg border border-[#c6933d4f] px-3 py-1.5 hover:bg-[#d9ab5d1a]">Reset</button>
        <button type="button" onClick={props.onRetry} className="rounded-lg border border-[#c6933d4f] px-3 py-1.5 hover:bg-[#d9ab5d1a]">Retry</button>
        <button type="button" onClick={props.onRevealHint} className="rounded-lg border border-[#d9b36c90] px-3 py-1.5 text-[#f4e4c5] hover:bg-[#d9ab5d2f]">Indice</button>
      </div>

      <PuzzleSidebar
        categories={props.categories}
        activeCategory={props.session.activeCategory}
        filteredPuzzles={props.filteredPuzzles}
        activePuzzle={props.activePuzzle}
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
