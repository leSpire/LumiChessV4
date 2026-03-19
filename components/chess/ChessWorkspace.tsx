'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Square } from 'chess.js';
import { ChessBoard } from '@/components/chess/ChessBoard';
import { PromotionDialog } from '@/components/chess/PromotionDialog';
import { SidePanel } from '@/components/chess/SidePanel';
import { PuzzlePanel } from '@/components/puzzles/PuzzlePanel';
import { BOARD_THEMES } from '@/lib/boardThemes';
import { PIECE_THEMES } from '@/lib/pieceThemes';
import { playMoveSound, type SoundTheme } from '@/lib/sound';
import { usePlayVsAI } from '@/hooks/usePlayVsAI';
import { usePuzzleTraining } from '@/hooks/usePuzzleTraining';

const uciToArrow = (uci?: string): { from: Square; to: Square } | null => {
  if (!uci || uci.length < 4) return null;
  const from = uci.slice(0, 2) as Square;
  const to = uci.slice(2, 4) as Square;
  return { from, to };
};

export function ChessWorkspace() {
  const ai = usePlayVsAI();
  const puzzle = usePuzzleTraining();
  const game = ai.mode === 'puzzle' ? puzzle.game : ai.game;
  const [pieceTheme, setPieceTheme] = useState('classic');
  const [boardTheme, setBoardTheme] = useState('lumi-classic');
  const [soundTheme, setSoundTheme] = useState<SoundTheme>('classic');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showLegalMoves, setShowLegalMoves] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [modeChosen, setModeChosen] = useState(false);

  useEffect(() => {
    const savedPieceTheme = window.localStorage.getItem('lumichess-piece-theme');
    if (savedPieceTheme) setPieceTheme(savedPieceTheme);
    const savedBoardTheme = window.localStorage.getItem('lumichess-board-theme');
    if (savedBoardTheme) setBoardTheme(savedBoardTheme);

    const savedSoundTheme = window.localStorage.getItem('lumichess-sound-theme') as SoundTheme | null;
    if (savedSoundTheme === 'classic' || savedSoundTheme === 'soft') setSoundTheme(savedSoundTheme);

    const savedSoundEnabled = window.localStorage.getItem('lumichess-sound-enabled');
    if (savedSoundEnabled) setSoundEnabled(savedSoundEnabled === 'true');
    const savedShowLegalMoves = window.localStorage.getItem('lumichess-show-legal-moves');
    if (savedShowLegalMoves) setShowLegalMoves(savedShowLegalMoves === 'true');
  }, []);

  useEffect(() => window.localStorage.setItem('lumichess-piece-theme', pieceTheme), [pieceTheme]);
  useEffect(() => window.localStorage.setItem('lumichess-board-theme', boardTheme), [boardTheme]);
  useEffect(() => window.localStorage.setItem('lumichess-sound-theme', soundTheme), [soundTheme]);
  useEffect(() => window.localStorage.setItem('lumichess-sound-enabled', String(soundEnabled)), [soundEnabled]);
  useEffect(() => window.localStorage.setItem('lumichess-show-legal-moves', String(showLegalMoves)), [showLegalMoves]);

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


  useEffect(() => {
    if (ai.mode === 'puzzle' && !puzzle.activePuzzle) {
      puzzle.loadPuzzleByIndex(0);
    }
  }, [ai.mode, puzzle]);

  const chooseMode = (mode: 'play-vs-ai' | 'analysis' | 'puzzle') => {
    ai.setMode(mode);
    setModeChosen(true);
  };

  const handleSquareAction = ai.mode === 'puzzle' ? puzzle.game.handleSquareAction : ai.handleSquareAction;
  const handlePiecePointer = ai.mode === 'puzzle' ? puzzle.game.setFromPiecePointer : ai.handlePiecePointer;
  const handleDrop = ai.mode === 'puzzle' ? puzzle.playUserMove : ai.requestPlayerMove;

  return (
    <section className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
      {!modeChosen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#090704f0] p-4">
          <div className="w-full max-w-xl rounded-3xl border border-[#c6933d70] bg-[#14100be8] p-6 text-center text-[#f4e4c9] shadow-2xl">
            <p className="mb-2 text-sm uppercase tracking-[0.2em] text-[#d9b36c]">Bienvenue</p>
            <h2 className="mb-5 text-2xl font-semibold">Choisis ton mode de jeu</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <button type="button" onClick={() => chooseMode('play-vs-ai')} className="rounded-xl border border-[#d9b36c] bg-[#d9ab5d2c] px-4 py-3 font-medium hover:bg-[#d9ab5d3f]">
                Jouer contre IA
              </button>
              <button type="button" onClick={() => chooseMode('analysis')} className="rounded-xl border border-[#c6933d70] px-4 py-3 font-medium hover:bg-[#d9ab5d1f]">
                Analyse de partie
              </button>
              <button type="button" onClick={() => chooseMode('puzzle')} className="rounded-xl border border-[#c6933d70] px-4 py-3 font-medium hover:bg-[#d9ab5d1f]">
                Puzzles tactiques
              </button>
            </div>
          </div>
        </div>
      )}
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
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => ai.setMode('play-vs-ai')}
                  className={`rounded-lg border px-2 py-1.5 transition ${
                    ai.mode === 'play-vs-ai'
                      ? 'border-[#d9b36c] bg-[#d9ab5d2c] text-[#f8e8c8]'
                      : 'border-[#c6933d42] text-[#d9c09a] hover:bg-[#d9ab5d1a]'
                  }`}
                >
                  Contre IA
                </button>
                <button
                  type="button"
                  onClick={() => ai.setMode('analysis')}
                  className={`rounded-lg border px-2 py-1.5 transition ${
                    ai.mode === 'analysis'
                      ? 'border-[#d9b36c] bg-[#d9ab5d2c] text-[#f8e8c8]'
                      : 'border-[#c6933d42] text-[#d9c09a] hover:bg-[#d9ab5d1a]'
                  }`}
                >
                  Analyse libre
                </button>
                <button
                  type="button"
                  onClick={() => {
                    ai.setMode('puzzle');
                    if (!puzzle.activePuzzle) puzzle.loadPuzzleByIndex(0);
                  }}
                  className={`rounded-lg border px-2 py-1.5 transition ${
                    ai.mode === 'puzzle'
                      ? 'border-[#d9b36c] bg-[#d9ab5d2c] text-[#f8e8c8]'
                      : 'border-[#c6933d42] text-[#d9c09a] hover:bg-[#d9ab5d1a]'
                  }`}
                >
                  Puzzle
                </button>
              </div>
            </section>

            <section>
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-[#d9b36c]">Ordinateur</p>
              <label className="mb-2 block">Niveau IA
                <select value={ai.level} onChange={(evt) => ai.setLevel(evt.target.value as typeof ai.level)} disabled={!ai.isPlayVsAiMode} className="mt-1 w-full rounded border border-[#c6933d42] bg-[#0c0907] px-2 py-1.5 disabled:opacity-50">
                  {ai.levels.map((level) => <option key={level.id} value={level.id}>{level.label}</option>)}
                </select>
              </label>
              <label className="mb-2 block">Profondeur
                <input type="range" min={4} max={30} value={ai.engineDepth} onChange={(evt) => ai.setEngineDepth(Number(evt.target.value))} disabled={!ai.isPlayVsAiMode} className="mt-1 w-full disabled:opacity-50" />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label>Threads
                  <input type="number" min={1} max={32} value={ai.engineThreads} onChange={(evt) => ai.setEngineThreads(Number(evt.target.value) || 1)} disabled={!ai.isPlayVsAiMode} className="mt-1 w-full rounded border border-[#c6933d42] bg-[#0c0907] px-2 py-1.5 disabled:opacity-50" />
                </label>
                <label>Variantes
                  <input type="number" min={1} max={5} value={ai.engineMultiPv} onChange={(evt) => ai.setEngineMultiPv(Number(evt.target.value) || 1)} disabled={!ai.isPlayVsAiMode} className="mt-1 w-full rounded border border-[#c6933d42] bg-[#0c0907] px-2 py-1.5 disabled:opacity-50" />
                </label>
              </div>
            </section>

            <section>
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-[#d9b36c]">Interface</p>
              <label className="mb-1 flex items-center justify-between"><span>Flèches suggestion Stockfish</span><input type="checkbox" checked={ai.showSuggestionArrows} onChange={(evt) => ai.setShowSuggestionArrows(evt.target.checked)} /></label>
              <label className="mb-1 flex items-center justify-between"><span>Afficher menaces</span><input type="checkbox" checked={ai.showThreats} onChange={(evt) => ai.setShowThreats(evt.target.checked)} /></label>
              <label className="mb-1 flex items-center justify-between"><span>Coups légaux</span><input type="checkbox" checked={showLegalMoves} onChange={(evt) => setShowLegalMoves(evt.target.checked)} /></label>
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
          onSquareClick={handleSquareAction}
          onPiecePointerDown={handlePiecePointer}
          onPieceDrop={handleDrop}
          pieceTheme={pieceTheme}
          boardTheme={boardTheme}
          suggestedArrows={ai.mode === 'puzzle' ? [] : suggestedArrows}
          showLegalMoves={showLegalMoves}
        />
        {game.pendingPromotion && <PromotionDialog color={game.pendingPromotion.color} onSelect={game.handlePromotion} />}
      </div>

      {ai.mode === 'puzzle' ? (
        <PuzzlePanel
          categories={puzzle.categories}
          filteredPuzzles={puzzle.filteredPuzzles}
          activePuzzle={puzzle.activePuzzle}
          activePuzzleIndex={puzzle.activePuzzleIndex}
          session={puzzle.session}
          progress={puzzle.progress}
          onCategorySelect={puzzle.selectCategory}
          onPuzzleSelect={puzzle.selectPuzzleById}
          onApplyRatingRange={(min, max) => puzzle.setRatingRange({ min, max })}
          onReset={puzzle.resetPuzzle}
          onRetry={puzzle.retryPuzzle}
          onNextPuzzle={puzzle.nextPuzzle}
          onPreviousPuzzle={puzzle.previousPuzzle}
          onRevealHint={puzzle.revealNextMove}
        />
      ) : (
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
          pgn={game.pgn}
          onImportPgn={game.loadPgn}
        />
      )}
    </section>
  );
}
