'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Square } from 'chess.js';
import { ChessBoard } from '@/components/chess/ChessBoard';
import { PromotionDialog } from '@/components/chess/PromotionDialog';
import { SidePanel } from '@/components/chess/SidePanel';
import { BOARD_THEMES } from '@/lib/boardThemes';
import { PIECE_THEMES } from '@/lib/pieceThemes';
import { playMoveSound, type SoundTheme } from '@/lib/sound';
import { usePlayVsAI } from '@/hooks/usePlayVsAI';

const uciToArrow = (uci?: string): { from: Square; to: Square } | null => {
  if (!uci || uci.length < 4) return null;
  const from = uci.slice(0, 2) as Square;
  const to = uci.slice(2, 4) as Square;
  return { from, to };
};

export function ChessWorkspace() {
  const ai = usePlayVsAI();
  const game = ai.game;
  const [pieceTheme, setPieceTheme] = useState('classic');
  const [boardTheme, setBoardTheme] = useState('lumi-classic');
  const [soundTheme, setSoundTheme] = useState<SoundTheme>('classic');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const savedPieceTheme = window.localStorage.getItem('lumichess-piece-theme');
    if (savedPieceTheme) setPieceTheme(savedPieceTheme);
    const savedBoardTheme = window.localStorage.getItem('lumichess-board-theme');
    if (savedBoardTheme) setBoardTheme(savedBoardTheme);

    const savedSoundTheme = window.localStorage.getItem('lumichess-sound-theme') as SoundTheme | null;
    if (savedSoundTheme === 'classic' || savedSoundTheme === 'soft') setSoundTheme(savedSoundTheme);

    const savedSoundEnabled = window.localStorage.getItem('lumichess-sound-enabled');
    if (savedSoundEnabled) setSoundEnabled(savedSoundEnabled === 'true');
  }, []);

  useEffect(() => window.localStorage.setItem('lumichess-piece-theme', pieceTheme), [pieceTheme]);
  useEffect(() => window.localStorage.setItem('lumichess-board-theme', boardTheme), [boardTheme]);
  useEffect(() => window.localStorage.setItem('lumichess-sound-theme', soundTheme), [soundTheme]);
  useEffect(() => window.localStorage.setItem('lumichess-sound-enabled', String(soundEnabled)), [soundEnabled]);

  useEffect(() => {
    const san = game.lastMoveSan;
    if (!san) return;

    if (san.includes('#') || san.includes('+')) {
      playMoveSound('check', soundTheme, soundEnabled);
      return;
    }

    if (san.includes('O-O')) {
      playMoveSound('castle', soundTheme, soundEnabled);
      return;
    }

    playMoveSound(san.includes('x') ? 'capture' : 'move', soundTheme, soundEnabled);
  }, [game.lastMoveSan, soundEnabled, soundTheme]);

  const suggestedArrows = useMemo(() => {
    if (!ai.enabled) return [];
    if (!ai.showSuggestionArrows) return [];

    const arrows: Array<{ from: Square; to: Square; color?: 'blue' | 'red' }> = [];
    const pvLines = ai.engine.output.pvLines ?? [];

    pvLines.slice(0, ai.engineMultiPv).forEach((line) => {
      const topMove = uciToArrow(line.pv?.moves?.[0]);
      if (topMove) arrows.push({ ...topMove, color: 'blue' });
    });

    if (ai.showThreats) {
      const threatMove = uciToArrow(ai.engine.output.pv?.moves?.[1]);
      if (threatMove) arrows.push({ ...threatMove, color: 'red' });
    }

    return arrows;
  }, [ai.engine.output.pv?.moves, ai.engine.output.pvLines, ai.engineMultiPv, ai.showSuggestionArrows, ai.showThreats]);

  return (
    <section className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
      <div>
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={() => setSettingsOpen((current) => !current)}
            className="z-30 rounded-full border border-[#d3aa64aa] bg-[#0e0c09e6] px-3 py-2 text-sm text-[#f4dfb6]"
            aria-label="Ouvrir les paramètres"
          >
            ⚙️
          </button>
        </div>

        {settingsOpen && (
          <div className="mb-3 ml-auto w-80 space-y-3 rounded-2xl border border-[#c6933d70] bg-[#14100be8] p-4 text-xs text-[#f4e4c9] shadow-2xl backdrop-blur">
            <section>
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-[#d9b36c]">Mode de jeu</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => ai.setEnabled(true)}
                  className={`rounded-lg border px-2 py-1.5 transition ${
                    ai.enabled
                      ? 'border-[#d9b36c] bg-[#d9ab5d2c] text-[#f8e8c8]'
                      : 'border-[#c6933d42] text-[#d9c09a] hover:bg-[#d9ab5d1a]'
                  }`}
                >
                  Contre IA
                </button>
                <button
                  type="button"
                  onClick={() => ai.setEnabled(false)}
                  className={`rounded-lg border px-2 py-1.5 transition ${
                    !ai.enabled
                      ? 'border-[#d9b36c] bg-[#d9ab5d2c] text-[#f8e8c8]'
                      : 'border-[#c6933d42] text-[#d9c09a] hover:bg-[#d9ab5d1a]'
                  }`}
                >
                  Échiquier libre
                </button>
              </div>
            </section>

            <section>
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-[#d9b36c]">Ordinateur</p>
              <label className="mb-2 block">Niveau IA
                <select value={ai.level} onChange={(evt) => ai.setLevel(evt.target.value as typeof ai.level)} disabled={!ai.enabled} className="mt-1 w-full rounded border border-[#c6933d42] bg-[#0c0907] px-2 py-1.5 disabled:opacity-50">
                  {ai.levels.map((level) => <option key={level.id} value={level.id}>{level.label}</option>)}
                </select>
              </label>
              <label className="mb-2 block">Profondeur
                <input type="range" min={4} max={30} value={ai.engineDepth} onChange={(evt) => ai.setEngineDepth(Number(evt.target.value))} disabled={!ai.enabled} className="mt-1 w-full disabled:opacity-50" />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label>Threads
                  <input type="number" min={1} max={32} value={ai.engineThreads} onChange={(evt) => ai.setEngineThreads(Number(evt.target.value) || 1)} disabled={!ai.enabled} className="mt-1 w-full rounded border border-[#c6933d42] bg-[#0c0907] px-2 py-1.5 disabled:opacity-50" />
                </label>
                <label>Variantes
                  <input type="number" min={1} max={5} value={ai.engineMultiPv} onChange={(evt) => ai.setEngineMultiPv(Number(evt.target.value) || 1)} disabled={!ai.enabled} className="mt-1 w-full rounded border border-[#c6933d42] bg-[#0c0907] px-2 py-1.5 disabled:opacity-50" />
                </label>
              </div>
            </section>

            <section>
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-[#d9b36c]">Interface</p>
              <label className="mb-1 flex items-center justify-between"><span>Flèches suggestion Stockfish</span><input type="checkbox" checked={ai.showSuggestionArrows} onChange={(evt) => ai.setShowSuggestionArrows(evt.target.checked)} /></label>
              <label className="mb-1 flex items-center justify-between"><span>Afficher menaces</span><input type="checkbox" checked={ai.showThreats} onChange={(evt) => ai.setShowThreats(evt.target.checked)} /></label>
              <label className="mb-1 flex items-center justify-between"><span>Sons</span><input type="checkbox" checked={soundEnabled} onChange={(evt) => setSoundEnabled(evt.target.checked)} /></label>
            </section>

            <section>
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-[#d9b36c]">Échiquier</p>
              <label className="mb-2 block">Pièces
                <select value={pieceTheme} onChange={(evt) => setPieceTheme(evt.target.value)} className="mt-1 w-full rounded border border-[#c6933d42] bg-[#0c0907] px-2 py-1.5">{PIECE_THEMES.map((theme) => <option key={theme.id} value={theme.id}>{theme.label}</option>)}</select>
              </label>
              <label className="mb-2 block">Plateau
                <select value={boardTheme} onChange={(evt) => setBoardTheme(evt.target.value)} className="mt-1 w-full rounded border border-[#c6933d42] bg-[#0c0907] px-2 py-1.5">{BOARD_THEMES.map((theme) => <option key={theme.id} value={theme.id}>{theme.label}</option>)}</select>
              </label>
              <label className="block">Thème sonore
                <select value={soundTheme} onChange={(evt) => setSoundTheme(evt.target.value as SoundTheme)} className="mt-1 w-full rounded border border-[#c6933d42] bg-[#0c0907] px-2 py-1.5">
                  <option value="classic">Classic</option>
                  <option value="soft">Soft</option>
                </select>
              </label>
            </section>
          </div>
        )}

        <ChessBoard
          orientation={game.orientation}
          turn={game.turn}
          selectedSquare={game.selectedSquare}
          legalTargets={game.legalTargets}
          inCheckSquare={game.checkSquare}
          lastMove={game.lastMove}
          pieces={game.pieces}
          onSquareClick={ai.handleSquareAction}
          onPiecePointerDown={ai.handlePiecePointer}
          onPieceDrop={ai.requestPlayerMove}
          pieceTheme={pieceTheme}
          boardTheme={boardTheme}
          suggestedArrows={suggestedArrows}
        />
        {game.pendingPromotion && <PromotionDialog color={game.pendingPromotion.color} onSelect={game.handlePromotion} />}
      </div>

      <SidePanel
        status={game.status}
        history={game.history}
        currentIndex={game.currentIndex}
        positionsCount={game.positionsCount}
        onNavigate={game.navigate}
        onMoveToIndex={game.moveToIndex}
        engineStatus={ai.engine.status}
        engineError={ai.engine.error}
        engineOutput={ai.engine.output}
      />
    </section>
  );
}
