'use client';

import { motion } from 'framer-motion';
import { type PointerEvent, useMemo, useRef, useState } from 'react';
import type { Square } from 'chess.js';
import clsx from 'clsx';
import { ChessPiece } from '@/components/chess/ChessPiece';
import { FILES, RANKS, coordsToSquare, getDisplayFiles, getDisplayRanks, isLightSquare, squareToCoords } from '@/lib/chessboard';
import type { ChessBoardProps } from '@/types/chess';

interface DragState {
  from: Square;
  x: number;
  y: number;
}

function pointerToSquare(
  evt: PointerEvent<HTMLDivElement>,
  boardElement: HTMLDivElement,
  orientation: 'w' | 'b'
): Square | null {
  const rect = boardElement.getBoundingClientRect();
  const x = evt.clientX - rect.left;
  const y = evt.clientY - rect.top;

  if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;

  const col = Math.floor((x / rect.width) * 8);
  const row = Math.floor((y / rect.height) * 8);
  const file = orientation === 'w' ? col : 7 - col;
  const rank = orientation === 'w' ? 7 - row : row;

  return coordsToSquare(file, rank);
}

export function ChessBoard({
  orientation,
  selectedSquare,
  legalTargets,
  inCheckSquare,
  lastMove,
  pieces,
  onSquareClick,
  onPiecePointerDown,
  onPieceDrop
}: ChessBoardProps) {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);

  const files = getDisplayFiles(orientation);
  const ranks = getDisplayRanks(orientation);
  const legalTargetSet = useMemo(() => new Set(legalTargets), [legalTargets]);

  const piecePosition = (square: Square) => {
    const { file, rank } = squareToCoords(square);
    const col = orientation === 'w' ? file : 7 - file;
    const row = orientation === 'w' ? 7 - rank : rank;
    return { col, row };
  };

  return (
    <section className="w-full max-w-[min(92vw,760px)]" aria-label="Échiquier LumiChess">
      <div className="relative rounded-3xl border border-[#c6933d33] bg-gradient-to-b from-[#1b1510] to-[#0d0b08] p-3 shadow-board">
        <div
          ref={boardRef}
          className="relative grid aspect-square w-full grid-cols-8 overflow-hidden rounded-2xl border border-[#d3a55b33]"
          onPointerMove={(evt) => {
            if (!dragState || !boardRef.current) return;
            const rect = boardRef.current.getBoundingClientRect();
            setDragState({
              ...dragState,
              x: evt.clientX - rect.left,
              y: evt.clientY - rect.top
            });
          }}
          onPointerUp={(evt) => {
            if (!dragState || !boardRef.current) return;
            const to = pointerToSquare(evt, boardRef.current, orientation);
            if (to) onPieceDrop(dragState.from, to);
            setDragState(null);
          }}
        >
          {Array.from({ length: 64 }).map((_, index) => {
            const row = Math.floor(index / 8);
            const col = index % 8;
            const file = orientation === 'w' ? col : 7 - col;
            const rank = orientation === 'w' ? 7 - row : row;
            const square = coordsToSquare(file, rank);

            const isSelected = selectedSquare === square;
            const isTarget = legalTargetSet.has(square);
            const isLastMove = lastMove?.from === square || lastMove?.to === square;
            const isCheck = inCheckSquare === square;

            return (
              <button
                key={square}
                type="button"
                className={clsx(
                  'group relative flex items-center justify-center transition-colors duration-150',
                  isLightSquare(square)
                    ? 'bg-gradient-to-br from-[#e7d2ad] to-[#d6bf99]'
                    : 'bg-gradient-to-br from-[#7d5c34] to-[#5c4326]'
                )}
                onClick={() => onSquareClick(square)}
                aria-label={`Case ${square}`}
              >
                {isLastMove && <span className="pointer-events-none absolute inset-0 bg-[#e3b15e33]" />}
                {isSelected && <span className="pointer-events-none absolute inset-1 rounded-sm border-2 border-[#f1cd8a] shadow-glow" />}
                {isCheck && <span className="pointer-events-none absolute inset-0 bg-[#d84c4c80]" />}
                {isTarget && (
                  <span className="pointer-events-none absolute h-3.5 w-3.5 rounded-full bg-[#f0d199cc] shadow-[0_0_16px_rgba(240,209,153,0.65)]" />
                )}
                {(row === 7 || row === 0 || col === 0 || col === 7) && (
                  <span className="pointer-events-none absolute inset-0 ring-1 ring-black/5" />
                )}
              </button>
            );
          })}

          {pieces.map((piece) => {
            const { row, col } = piecePosition(piece.square);
            const isDragging = dragState?.from === piece.square;
            const width = '12.5%';
            const left = `${col * 12.5}%`;
            const top = `${row * 12.5}%`;

            return (
              <motion.button
                key={`${piece.square}-${piece.type}-${piece.color}`}
                type="button"
                className={clsx('absolute z-10 p-1.5 sm:p-2', isDragging && 'z-20')}
                style={
                  isDragging
                    ? {
                        width,
                        left: `calc(${((dragState?.x ?? 0) / (boardRef.current?.clientWidth ?? 1)) * 100}% - 6.25%)`,
                        top: `calc(${((dragState?.y ?? 0) / (boardRef.current?.clientHeight ?? 1)) * 100}% - 6.25%)`
                      }
                    : { width, left, top }
                }
                animate={{ left, top }}
                transition={{ type: 'spring', stiffness: 400, damping: 32, mass: 0.35 }}
                onPointerDown={(evt) => {
                  if (!boardRef.current) return;
                  const rect = boardRef.current.getBoundingClientRect();
                  evt.currentTarget.setPointerCapture(evt.pointerId);
                  onPiecePointerDown(piece.square);
                  setDragState({
                    from: piece.square,
                    x: evt.clientX - rect.left,
                    y: evt.clientY - rect.top
                  });
                }}
                aria-label={`Pièce ${piece.color === 'w' ? 'blanche' : 'noire'} ${piece.type} sur ${piece.square}`}
              >
                <ChessPiece type={piece.type} color={piece.color} isDragging={isDragging} />
              </motion.button>
            );
          })}

          {FILES.map((file, index) => {
            const display = orientation === 'w' ? file : FILES[7 - index];
            return (
              <span
                key={`${file}-coord`}
                className="pointer-events-none absolute bottom-1 text-[10px] font-medium uppercase tracking-wide text-black/60"
                style={{ left: `${index * 12.5 + 1.3}%` }}
              >
                {display}
              </span>
            );
          })}

          {RANKS.map((rank, index) => {
            const display = orientation === 'w' ? RANKS[7 - index] : rank;
            return (
              <span
                key={`${rank}-coord`}
                className="pointer-events-none absolute right-1 text-[10px] font-medium tracking-wide text-black/60"
                style={{ top: `${index * 12.5 + 1.2}%` }}
              >
                {display}
              </span>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between px-1 text-xs text-[#ddc08f]">
        <span>Vue: {orientation === 'w' ? 'Blancs' : 'Noirs'}</span>
        <span>Drag & drop + click-to-move</span>
      </div>
    </section>
  );
}
