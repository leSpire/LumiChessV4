'use client';

import { useEffect, useMemo, useState } from 'react';
import { EnginePanel } from '@/components/chess/EnginePanel';
import { BOARD_THEMES } from '@/lib/boardThemes';
import { PIECE_THEMES } from '@/lib/pieceThemes';
import type { MoveHistoryEntry } from '@/types/chess';
import type { AiDifficultyConfig, EngineOutput, EngineStatus } from '@/types/engine';
import type { GameError, PgnMetadata, ServiceResult } from '@/types/game';

interface SidePanelProps {
  status: string;
  fen: string;
  pgn: string;
  history: MoveHistoryEntry[];
  currentIndex: number;
  positionsCount: number;
  metadata: PgnMetadata;
  error: GameError | null;
  onReset: () => void;
  onToggleOrientation: () => void;
  onLoadFen: (fen: string) => ServiceResult<unknown>;
  onLoadPgn: (pgn: string) => ServiceResult<unknown>;
  onNavigate: (action: 'start' | 'prev' | 'next' | 'end') => void;
  onMoveToIndex: (index: number) => void;
  pieceTheme: string;
  onPieceThemeChange: (themeId: string) => void;
  boardTheme: string;
  onBoardThemeChange: (themeId: string) => void;
  aiEnabled: boolean;
  playerColor: 'w' | 'b';
  aiLevel: string;
  aiLevels: AiDifficultyConfig[];
  engineStatus: EngineStatus;
  engineError: string | null;
  engineOutput: EngineOutput;
  bestMoveLabel: string;
  showBestMove: boolean;
  onToggleAiEnabled: (value: boolean) => void;
  onPlayerColorChange: (value: 'w' | 'b') => void;
  onAiLevelChange: (value: string) => void;
  onNewAiGame: () => void;
  onResetAi: () => void;
  onToggleBestMove: (value: boolean) => void;
}

export function SidePanel({
  status,
  fen,
  pgn,
  history,
  currentIndex,
  positionsCount,
  metadata,
  error,
  onReset,
  onToggleOrientation,
  onLoadFen,
  onLoadPgn,
  onNavigate,
  onMoveToIndex,
  pieceTheme,
  onPieceThemeChange,
  boardTheme,
  onBoardThemeChange,
  aiEnabled,
  playerColor,
  aiLevel,
  aiLevels,
  engineStatus,
  engineError,
  engineOutput,
  bestMoveLabel,
  showBestMove,
  onToggleAiEnabled,
  onPlayerColorChange,
  onAiLevelChange,
  onNewAiGame,
  onResetAi,
  onToggleBestMove
}: SidePanelProps) {
  const [fenInput, setFenInput] = useState(fen);
  const [pgnInput, setPgnInput] = useState(pgn);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => setFenInput(fen), [fen]);
  useEffect(() => setPgnInput(pgn), [pgn]);

  useEffect(() => {
    const handleKeyDown = (evt: KeyboardEvent) => {
      const target = evt.target as HTMLElement | null;
      const tagName = target?.tagName;
      const isTyping =
        tagName === 'INPUT' ||
        tagName === 'TEXTAREA' ||
        target?.isContentEditable;

      if (isTyping) return;

      if (evt.key === 'ArrowLeft') {
        evt.preventDefault();
        onNavigate('prev');
      }

      if (evt.key === 'ArrowRight') {
        evt.preventDefault();
        onNavigate('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate]);

  const metadataText = useMemo(() => {
    const keys: Array<keyof PgnMetadata> = ['Event', 'Site', 'Date', 'Round', 'White', 'Black', 'Result'];
    return keys
      .filter((key) => metadata[key])
      .map((key) => `${key}: ${metadata[key]}`)
      .join(' · ');
  }, [metadata]);

  const copyToClipboard = async (value: string, label: 'FEN' | 'PGN') => {
    try {
      await navigator.clipboard.writeText(value);
      setFeedback(`${label} copié.`);
    } catch {
      setFeedback(`Impossible de copier ${label}.`);
    }
  };

  return (
    <aside className="flex h-full min-h-[520px] w-full max-w-xl flex-col rounded-3xl border border-[#c6933d38] bg-gradient-to-b from-[#14110d] to-[#0b0907] p-5 shadow-board">
      <header className="mb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-[#c6933d]">LumiChess Engine Board</p>
        <h2 className="mt-1 text-xl font-semibold text-[#f6ead6]">Fondation FEN / PGN</h2>
        <p className="mt-2 rounded-lg border border-[#c6933d44] bg-[#0f0c09] px-3 py-2 text-sm text-[#ecd6ae]">{status}</p>
      </header>

      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <button type="button" onClick={onReset} className="rounded-xl border border-[#d9ab5d66] px-3 py-2 text-[#f4e1be] transition hover:bg-[#d9ab5d22]">
          Reset
        </button>
        <button
          type="button"
          onClick={onToggleOrientation}
          className="rounded-xl border border-[#d9ab5d40] px-3 py-2 text-[#f4e1be] transition hover:bg-[#d9ab5d22]"
        >
          Inverser la vue
        </button>
      </div>

      <EnginePanel
        enabled={aiEnabled}
        playerColor={playerColor}
        levelId={aiLevel}
        levels={aiLevels}
        status={engineStatus}
        engineError={engineError}
        output={engineOutput}
        bestMoveLabel={bestMoveLabel}
        showBestMove={showBestMove}
        onToggleEnabled={onToggleAiEnabled}
        onPlayerColorChange={onPlayerColorChange}
        onLevelChange={onAiLevelChange}
        onNewGame={onNewAiGame}
        onReset={onResetAi}
        onToggleBestMove={onToggleBestMove}
      />

      <section className="mb-4 rounded-2xl border border-[#c6933d2e] bg-[#0f0c09] p-3">
        <label className="mb-2 block text-xs text-[#cfac74]">Style des pièces</label>
        <select
          value={pieceTheme}
          onChange={(evt) => onPieceThemeChange(evt.target.value)}
          className="w-full rounded-lg border border-[#c6933d42] bg-[#0c0907] px-2 py-2 text-sm text-[#f4e4c9]"
        >
          {PIECE_THEMES.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.label}
            </option>
          ))}
        </select>

        <label className="mb-2 mt-3 block text-xs text-[#cfac74]">Style de l’échiquier</label>
        <select
          value={boardTheme}
          onChange={(evt) => onBoardThemeChange(evt.target.value)}
          className="w-full rounded-lg border border-[#c6933d42] bg-[#0c0907] px-2 py-2 text-sm text-[#f4e4c9]"
        >
          {BOARD_THEMES.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.label}
            </option>
          ))}
        </select>
      </section>

      <section className="mb-4 rounded-2xl border border-[#c6933d2e] bg-[#0f0c09] p-3">
        <div className="mb-2 flex items-center justify-between text-xs text-[#d2af74]">
          <span>Timeline</span>
          <span>
            Position {currentIndex}/{Math.max(positionsCount - 1, 0)}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2 text-xs text-[#f1dfbf]">
          <button type="button" onClick={() => onNavigate('start')} className="rounded-lg border border-[#c6933d42] px-2 py-1 hover:bg-[#d9ab5d1f]">⏮</button>
          <button type="button" onClick={() => onNavigate('prev')} className="rounded-lg border border-[#c6933d42] px-2 py-1 hover:bg-[#d9ab5d1f]">←</button>
          <button type="button" onClick={() => onNavigate('next')} className="rounded-lg border border-[#c6933d42] px-2 py-1 hover:bg-[#d9ab5d1f]">→</button>
          <button type="button" onClick={() => onNavigate('end')} className="rounded-lg border border-[#c6933d42] px-2 py-1 hover:bg-[#d9ab5d1f]">⏭</button>
        </div>
        <p className="mt-2 text-[11px] text-[#b99463]">Raccourcis clavier: ← coup précédent · → coup suivant</p>
      </section>

      <section className="mb-4 flex-1 overflow-hidden rounded-2xl border border-[#c6933d2e] bg-[#0f0c09]">
        <div className="max-h-[220px] overflow-y-auto p-3">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-[#0f0c09] text-[#ba9862]">
              <tr>
                <th className="pb-2 font-medium">#</th>
                <th className="pb-2 font-medium">Blancs</th>
                <th className="pb-2 font-medium">Noirs</th>
              </tr>
            </thead>
            <tbody className="text-[#f1dfbf]">
              {history.map((entry) => (
                <tr key={entry.moveNumber} className="border-t border-[#ffffff12]">
                  <td className="py-1.5 pr-1 text-[#b79867]">{entry.moveNumber}.</td>
                  <td>
                    {entry.white ? (
                      <button
                        type="button"
                        onClick={() => entry.white && onMoveToIndex(entry.white.ply)}
                        className="rounded px-1.5 py-0.5 hover:bg-[#d9ab5d1f]"
                      >
                        {entry.white.san}
                      </button>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    {entry.black ? (
                      <button
                        type="button"
                        onClick={() => entry.black && onMoveToIndex(entry.black.ply)}
                        className="rounded px-1.5 py-0.5 hover:bg-[#d9ab5d1f]"
                      >
                        {entry.black.san}
                      </button>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3 text-xs">
        <label className="block text-[#cfac74]">Import / Export FEN</label>
        <textarea value={fenInput} onChange={(evt) => setFenInput(evt.target.value)} className="h-20 w-full rounded-xl border border-[#c6933d2e] bg-[#0c0907] p-2 text-[#f4e4c9]" />
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              const result = onLoadFen(fenInput.trim());
              setFeedback(result.ok ? 'FEN chargé.' : result.error?.message ?? 'FEN invalide.');
            }}
            className="rounded-lg border border-[#c6933d42] px-2 py-1 hover:bg-[#d9ab5d1f]"
          >
            Charger FEN
          </button>
          <button type="button" onClick={() => copyToClipboard(fen, 'FEN')} className="rounded-lg border border-[#c6933d42] px-2 py-1 hover:bg-[#d9ab5d1f]">
            Copier FEN
          </button>
        </div>

        <label className="block text-[#cfac74]">Import / Export PGN</label>
        <textarea value={pgnInput} onChange={(evt) => setPgnInput(evt.target.value)} className="h-24 w-full rounded-xl border border-[#c6933d2e] bg-[#0c0907] p-2 text-[#f4e4c9]" />
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              const result = onLoadPgn(pgnInput.trim());
              setFeedback(result.ok ? 'PGN chargé.' : result.error?.message ?? 'PGN invalide.');
            }}
            className="rounded-lg border border-[#c6933d42] px-2 py-1 hover:bg-[#d9ab5d1f]"
          >
            Charger PGN
          </button>
          <button type="button" onClick={() => copyToClipboard(pgn, 'PGN')} className="rounded-lg border border-[#c6933d42] px-2 py-1 hover:bg-[#d9ab5d1f]">
            Copier PGN
          </button>
        </div>

        {metadataText && <p className="rounded-lg border border-[#c6933d2a] bg-[#17110b] px-2 py-1 text-[#cba56e]">{metadataText}</p>}
        {(feedback || error) && <p className="text-[#d7b37a]">{feedback ?? error?.message}</p>}
      </section>
    </aside>
  );
}
