'use client';

import type { PuzzleProgress, PuzzleSessionState } from '@/types/puzzle';

interface PuzzlePanelProps {
  session: PuzzleSessionState;
  progress: PuzzleProgress;
  puzzleIndex: number;
  puzzleCount: number;
  onReset: () => void;
  onRetry: () => void;
  onNextPuzzle: () => void;
  onPreviousPuzzle: () => void;
  onRevealHint: () => void;
}

export function PuzzlePanel({
  session,
  progress,
  puzzleIndex,
  puzzleCount,
  onReset,
  onRetry,
  onNextPuzzle,
  onPreviousPuzzle,
  onRevealHint
}: PuzzlePanelProps) {
  const puzzle = session.activePuzzle;

  return (
    <aside className="flex h-full min-h-[520px] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-[#c6933d38] bg-gradient-to-b from-[#1b1813] to-[#0b0907] shadow-board">
      <header className="border-b border-[#ffffff14] px-4 py-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[#c8a76e]">Puzzle tactique</p>
        <h2 className="mt-1 text-lg font-semibold text-[#f6ead6]">{puzzle?.title ?? 'Aucun puzzle chargé'}</h2>
        <p className="mt-1 text-xs text-[#c9ab78]">{puzzle?.description ?? 'Sélectionne un puzzle pour commencer.'}</p>
      </header>

      <section className="border-b border-[#ffffff14] px-4 py-3 text-sm text-[#e8d2ab]">
        <div className="mb-2 flex items-center justify-between">
          <span>Statut: <strong className="text-[#f4dfb9]">{session.status}</strong></span>
          <span>Erreurs: {session.errors}/{session.maxErrors}</span>
        </div>
        <p className="rounded-lg border border-[#ffffff14] bg-[#ffffff08] px-3 py-2 text-[#f4dfb9]">{session.feedback}</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#ffffff12]">
          <div className="h-full bg-[#d9b36c] transition-all" style={{ width: `${Math.round(progress.completionRatio * 100)}%` }} />
        </div>
        <p className="mt-1 text-xs text-[#c7a979]">Progression: {progress.completedMoves}/{progress.totalMoves} coups</p>
      </section>

      <section className="border-b border-[#ffffff14] px-4 py-3 text-xs text-[#d9bc8e]">
        <p className="mb-2 uppercase tracking-[0.18em] text-[#d9b36c]">Métadonnées</p>
        <div className="space-y-1">
          <p>Difficulté: {puzzle?.rating ?? '—'}</p>
          <p>Camp à jouer: {puzzle?.playerToMove === 'w' ? 'Blancs' : 'Noirs'}</p>
          <p>Thèmes: {puzzle?.themes.join(', ') ?? '—'}</p>
        </div>
      </section>

      <section className="border-b border-[#ffffff14] px-4 py-3 text-xs text-[#d9bc8e]">
        <p className="mb-2 uppercase tracking-[0.18em] text-[#d9b36c]">Actions</p>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={onReset} className="rounded-lg border border-[#c6933d42] px-2 py-1.5 hover:bg-[#d9ab5d1f]">Reset</button>
          <button type="button" onClick={onRetry} className="rounded-lg border border-[#c6933d42] px-2 py-1.5 hover:bg-[#d9ab5d1f]">Retry</button>
          <button type="button" onClick={onPreviousPuzzle} className="rounded-lg border border-[#c6933d42] px-2 py-1.5 hover:bg-[#d9ab5d1f]">Puzzle précédent</button>
          <button type="button" onClick={onNextPuzzle} className="rounded-lg border border-[#c6933d42] px-2 py-1.5 hover:bg-[#d9ab5d1f]">Puzzle suivant</button>
        </div>
        <button type="button" onClick={onRevealHint} className="mt-2 w-full rounded-lg border border-[#d9b36c70] bg-[#d9ab5d1f] px-2 py-1.5 text-[#f6dfb3] hover:bg-[#d9ab5d2c]">Indice</button>
      </section>

      <section className="flex-1 px-4 py-3 text-sm text-[#e3cda6]">
        <p className="mb-1 text-xs uppercase tracking-[0.18em] text-[#d9b36c]">Explication</p>
        <p className="rounded-lg border border-[#ffffff14] bg-[#ffffff08] p-3 text-[#f0dfc1]">
          {puzzle?.explanation ?? 'Une explication détaillée sera affichée ici après résolution.'}
        </p>
      </section>

      <footer className="border-t border-[#ffffff14] px-4 py-3 text-xs text-[#c9ab78]">
        Puzzle {puzzleCount === 0 ? 0 : puzzleIndex + 1}/{puzzleCount}
      </footer>
    </aside>
  );
}
