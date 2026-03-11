'use client';

import { useMemo, useState } from 'react';
import { formatEvaluation } from '@/lib/engine/uci';
import type { MoveHistoryEntry } from '@/types/chess';
import type { EngineOutput, EngineStatus } from '@/types/engine';

interface SidePanelProps {
  status: string;
  history: MoveHistoryEntry[];
  currentIndex: number;
  positionsCount: number;
  onNavigate: (action: 'start' | 'prev' | 'next' | 'end') => void;
  onMoveToIndex: (index: number) => void;
  engineStatus: EngineStatus;
  engineError: string | null;
  engineOutput: EngineOutput;
  pgn: string;
  onImportPgn: (pgn: string) => { ok: boolean; error?: { message: string } };
}

const STATUS_LABELS: Record<EngineStatus, string> = {
  idle: 'Inactif',
  initializing: 'Initialisation',
  ready: 'Prêt',
  thinking: 'Réflexion',
  stopped: 'Arrêté',
  error: 'Erreur'
};

export function SidePanel({
  status,
  history,
  currentIndex,
  positionsCount,
  onNavigate,
  onMoveToIndex,
  engineStatus,
  engineError,
  engineOutput,
  pgn,
  onImportPgn
}: SidePanelProps) {
  const [pgnInput, setPgnInput] = useState('');
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const topLines = useMemo(() => engineOutput.pvLines?.slice(0, 5) ?? [], [engineOutput.pvLines]);

  const handleImportPgn = () => {
    const result = onImportPgn(pgnInput);
    if (result.ok) {
      setImportMessage('PGN importé avec succès.');
      setPgnInput('');
      return;
    }

    setImportMessage(result.error?.message ?? 'Impossible d\'importer ce PGN.');
  };

  return (
    <aside className="flex h-full min-h-[520px] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-[#c6933d38] bg-gradient-to-b from-[#1b1813] to-[#0b0907] shadow-board">
      <header className="border-b border-[#ffffff14] px-4 py-3">
        <p className="text-sm font-semibold text-[#f6ead6]">Analyse</p>
        <p className="text-xs text-[#c9ab78]">{status}</p>
      </header>

      <section className="border-b border-[#ffffff14] px-4 py-3 text-xs text-[#e8d2ab]">
        <div className="mb-2 flex items-center justify-between">
          <span>Éval. {formatEvaluation(engineOutput.evaluation)}</span>
          <span>{STATUS_LABELS[engineStatus]}</span>
        </div>
        <div className="space-y-1">
          {topLines.length === 0 && <p className="text-[#9b7a4b]">En attente des variantes moteur…</p>}
          {topLines.map((line, index) => (
            <div key={`pv-${index}`} className="flex items-start gap-2 rounded-md bg-[#ffffff08] px-2 py-1">
              <span className="min-w-10 text-[#d9b36c]">#{index + 1}</span>
              <span className="line-clamp-1 flex-1 text-[#f3dfb9]">{line.pv?.line ?? '—'}</span>
              <span className="text-[#d9b36c]">{formatEvaluation(line.evaluation)}</span>
            </div>
          ))}
        </div>
        {engineError && <p className="mt-2 text-red-300">{engineError}</p>}
      </section>

      <section className="border-b border-[#ffffff14] px-4 py-3">
        <div className="mb-2 flex items-center justify-between text-xs text-[#d2af74]">
          <span>Coups</span>
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
      </section>

      <section className="border-b border-[#ffffff14] px-4 py-3 text-xs text-[#e8d2ab]">
        <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-[#d9b36c]">Importer un PGN</p>
        <textarea
          value={pgnInput}
          onChange={(event) => setPgnInput(event.target.value)}
          rows={4}
          placeholder="Collez votre PGN ici"
          className="w-full rounded border border-[#c6933d42] bg-[#0c0907] px-2 py-1.5 text-[#f1dfbf]"
        />
        <div className="mt-2 flex gap-2">
          <button type="button" onClick={handleImportPgn} className="rounded-lg border border-[#c6933d42] px-2 py-1 text-[#f1dfbf] hover:bg-[#d9ab5d1f]">
            Importer
          </button>
          <button
            type="button"
            onClick={() => setPgnInput(pgn)}
            className="rounded-lg border border-[#c6933d42] px-2 py-1 text-[#f1dfbf] hover:bg-[#d9ab5d1f]"
          >
            Charger le PGN actuel
          </button>
        </div>
        {importMessage && <p className="mt-2 text-[#c9ab78]">{importMessage}</p>}
      </section>

      <section className="flex-1 overflow-y-auto p-4">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-[#15110d] text-[#ba9862]">
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
                  {entry.white ? <button type="button" onClick={() => onMoveToIndex(entry.white!.ply)} className="rounded px-1.5 py-0.5 hover:bg-[#d9ab5d1f]">{entry.white.san}</button> : '—'}
                </td>
                <td>
                  {entry.black ? <button type="button" onClick={() => onMoveToIndex(entry.black!.ply)} className="rounded px-1.5 py-0.5 hover:bg-[#d9ab5d1f]">{entry.black.san}</button> : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </aside>
  );
}
