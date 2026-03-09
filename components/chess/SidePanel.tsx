'use client';

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
            <thead className="text-[#ba9862]">
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
        <textarea
          readOnly
          value={fen}
          className="h-20 w-full rounded-xl border border-[#c6933d2e] bg-[#0c0907] p-2 text-xs text-[#f4e4c9]"
        />

        <details className="rounded-xl border border-[#c6933d2e] bg-[#0c0907] p-2 text-xs text-[#f4e4c9]">
          <summary className="cursor-pointer text-[#d7b37a]">PGN (lecture / export)</summary>
          <textarea readOnly value={pgn} className="mt-2 h-20 w-full rounded-lg bg-[#090705] p-2" />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => onLoadFen(fen)} className="rounded-lg border border-[#c6933d42] px-2 py-1 hover:bg-[#d9ab5d1f]">
              Recharger FEN
            </button>
            <button type="button" onClick={() => onLoadPgn(pgn)} className="rounded-lg border border-[#c6933d42] px-2 py-1 hover:bg-[#d9ab5d1f]">
              Recharger PGN
            </button>
          </div>
        </details>
      </section>
    </aside>
  );
}
