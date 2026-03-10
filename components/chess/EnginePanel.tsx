'use client';

import type { Color } from 'chess.js';
import { formatEvaluation } from '@/lib/engine/uci';
import type { AiDifficultyConfig, EngineOutput, EngineStatus } from '@/types/engine';

interface EnginePanelProps {
  enabled: boolean;
  playerColor: Color;
  levelId: string;
  levels: AiDifficultyConfig[];
  status: EngineStatus;
  engineError: string | null;
  output: EngineOutput;
  bestMoveLabel: string;
  showBestMove: boolean;
  onToggleEnabled: (value: boolean) => void;
  onPlayerColorChange: (value: Color) => void;
  onLevelChange: (value: string) => void;
  onNewGame: () => void;
  onReset: () => void;
  onToggleBestMove: (value: boolean) => void;
}

const STATUS_LABELS: Record<EngineStatus, string> = {
  idle: 'Inactif',
  initializing: 'Initialisation',
  ready: 'Prêt',
  thinking: 'Réflexion',
  stopped: 'Arrêté',
  error: 'Erreur'
};

export function EnginePanel(props: EnginePanelProps) {
  const {
    enabled,
    playerColor,
    levelId,
    levels,
    status,
    engineError,
    output,
    bestMoveLabel,
    showBestMove,
    onToggleEnabled,
    onPlayerColorChange,
    onLevelChange,
    onNewGame,
    onReset,
    onToggleBestMove
  } = props;

  return (
    <section className="mb-4 rounded-2xl border border-[#c6933d2e] bg-[#0f0c09] p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.16em] text-[#cfac74]">IA / Moteur</p>
        <label className="flex items-center gap-2 text-xs text-[#e9d3ab]">
          <span>Actif</span>
          <input type="checkbox" checked={enabled} onChange={(evt) => onToggleEnabled(evt.target.checked)} />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <button type="button" onClick={onNewGame} className="rounded-lg border border-[#c6933d42] px-2 py-1 text-[#f1dfbf] hover:bg-[#d9ab5d1f]">
          Nouvelle partie IA
        </button>
        <button type="button" onClick={onReset} className="rounded-lg border border-[#c6933d42] px-2 py-1 text-[#f1dfbf] hover:bg-[#d9ab5d1f]">
          Reset IA
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="text-xs text-[#cfac74]">
          Couleur joueur
          <select
            value={playerColor}
            onChange={(evt) => onPlayerColorChange(evt.target.value as Color)}
            className="mt-1 w-full rounded-lg border border-[#c6933d42] bg-[#0c0907] px-2 py-2 text-sm text-[#f4e4c9]"
          >
            <option value="w">Blanc</option>
            <option value="b">Noir</option>
          </select>
        </label>

        <label className="text-xs text-[#cfac74]">
          Niveau IA
          <select
            value={levelId}
            onChange={(evt) => onLevelChange(evt.target.value)}
            className="mt-1 w-full rounded-lg border border-[#c6933d42] bg-[#0c0907] px-2 py-2 text-sm text-[#f4e4c9]"
          >
            {levels.map((level) => (
              <option key={level.id} value={level.id}>
                {level.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3 rounded-xl border border-[#c6933d2e] bg-[#15100b] p-2 text-xs text-[#e8d2ab]">
        <p>Statut moteur : <span className="font-semibold">{STATUS_LABELS[status]}</span></p>
        <p>Évaluation : <span className="font-semibold">{formatEvaluation(output.evaluation)}</span></p>
        <p>Profondeur : <span className="font-semibold">{output.depth || '—'}</span></p>
        <p>Meilleur coup : <span className="font-semibold">{bestMoveLabel}</span></p>
      </div>

      <label className="mt-3 flex items-center gap-2 text-xs text-[#e9d3ab]">
        <input type="checkbox" checked={showBestMove} onChange={(evt) => onToggleBestMove(evt.target.checked)} />
        Afficher le meilleur coup
      </label>

      {output.pv?.line && <p className="mt-2 text-[11px] text-[#b99463]">PV: {output.pv.line}</p>}
      {engineError && <p className="mt-2 text-[11px] text-red-300">{engineError}</p>}
    </section>
  );
}
