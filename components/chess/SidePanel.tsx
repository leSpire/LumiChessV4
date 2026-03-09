'use client';

import { useEffect, useState } from 'react';
import type { MoveHistoryEntry } from '@/types/chess';

interface SidePanelProps {
  status: string;
  fen: string;
  pgn: string;
  history: MoveHistoryEntry[];
  onReset: () => void;
  onToggleOrientation: () => void;
  onLoadFen: (fen: string) => boolean;
  onLoadPgn: (pgn: string) => boolean;
}

export function SidePanel({
  status,
  fen,
  pgn,
  history,
  onReset,
  onToggleOrientation,
  onLoadFen,
  onLoadPgn
}: SidePanelProps) {
  const [fenInput, setFenInput] = useState(fen);
  const [pgnInput, setPgnInput] = useState(pgn);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => setFenInput(fen), [fen]);
  useEffect(() => setPgnInput(pgn), [pgn]);

  return (
    <aside className="flex h-full min-h-[520px] w-full max-w-xl flex-col rounded-3xl border border-[#c6933d38] bg-gradient-to-b from-[#14110d] to-[#0b0907] p-5 shadow-board">
      <header className="mb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-[#c6933d]">LumiChess Engine Board</p>
        <h2 className="mt-1 text-xl font-semibold text-[#f6ead6]">Fondation de partie</h2>
        <p className="mt-2 rounded-lg border border-[#c6933d44] bg-[#0f0c09] px-3 py-2 text-sm text-[#ecd6ae]">{status}</p>
      </header>

      <div className="mb-4 flex gap-2">
        <button type="button" onClick={onReset} className="rounded-xl border border-[#d9ab5d66] px-3 py-2 text-sm text-[#f4e1be] transition hover:bg-[#d9ab5d22]">
          Reset
        </button>
        <button
          type="button"
          onClick={onToggleOrientation}
          className="rounded-xl border border-[#d9ab5d40] px-3 py-2 text-sm text-[#f4e1be] transition hover:bg-[#d9ab5d22]"
        >
          Inverser la vue
        </button>
      </div>

      <section className="mb-4 flex-1 overflow-hidden rounded-2xl border border-[#c6933d2e] bg-[#0f0c09]">
        <div className="max-h-[260px] overflow-y-auto p-3">
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
                  <td className="py-1.5">{entry.white?.san ?? '—'}</td>
                  <td className="py-1.5">{entry.black?.san ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <label className="block text-xs text-[#cfac74]">FEN courant</label>
        <textarea value={fenInput} onChange={(evt) => setFenInput(evt.target.value)} className="h-20 w-full rounded-xl border border-[#c6933d2e] bg-[#0c0907] p-2 text-xs text-[#f4e4c9]" />

        <label className="block text-xs text-[#cfac74]">PGN (style Lichess, import/export)</label>
        <textarea value={pgnInput} onChange={(evt) => setPgnInput(evt.target.value)} className="h-28 w-full rounded-xl border border-[#c6933d2e] bg-[#0c0907] p-2 text-xs text-[#f4e4c9]" />

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              const ok = onLoadFen(fenInput.trim());
              setFeedback(ok ? 'FEN chargé.' : 'FEN invalide.');
            }}
            className="rounded-lg border border-[#c6933d42] px-2 py-1 hover:bg-[#d9ab5d1f]"
          >
            Charger FEN
          </button>
          <button
            type="button"
            onClick={() => {
              const ok = onLoadPgn(pgnInput.trim());
              setFeedback(ok ? 'PGN chargé.' : 'PGN invalide.');
            }}
            className="rounded-lg border border-[#c6933d42] px-2 py-1 hover:bg-[#d9ab5d1f]"
          >
            Charger PGN
          </button>
        </div>

        {feedback && <p className="text-xs text-[#d7b37a]">{feedback}</p>}
      </section>
    </aside>
  );
}
