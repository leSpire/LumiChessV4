'use client';

import { motion } from 'framer-motion';
import { type PointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import type { Square } from 'chess.js';
import clsx from 'clsx';
import { ChessPiece } from '@/components/chess/ChessPiece';
import { getBoardTheme } from '@/lib/boardThemes';
import { coordsToSquare, getDisplayFiles, getDisplayRanks, isLightSquare, squareToCoords } from '@/lib/chessboard';
import type { ChessBoardProps } from '@/types/chess';

interface DragState {
  from: Square;
  x: number;
  y: number;
}

interface RightDragState {
  from: Square;
  x: number;
  y: number;
}

interface AnnotationArrow {
  from: Square;
  to: Square;
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
  turn,
  selectedSquare,
  legalTargets,
  inCheckSquare,
  lastMove,
  pieces,
  onSquareClick,
  onPiecePointerDown,
  onPieceDrop,
  pieceTheme,
  boardTheme
}: ChessBoardProps) {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [rightDragState, setRightDragState] = useState<RightDragState | null>(null);
  const [arrows, setArrows] = useState<AnnotationArrow[]>([]);
  const [markedSquares, setMarkedSquares] = useState<Square[]>([]);

  const files = getDisplayFiles(orientation);
  const ranks = getDisplayRanks(orientation);
  const legalTargetSet = useMemo(() => new Set(legalTargets), [legalTargets]);
  const selectedBoardTheme = getBoardTheme(boardTheme);

  const piecePosition = (square: Square) => {
    const { file, rank } = squareToCoords(square);
    const col = orientation === 'w' ? file : 7 - file;
    const row = orientation === 'w' ? 7 - rank : rank;
    return { col, row };
  };

  const squareCenter = (square: Square) => {
    const { col, row } = piecePosition(square);
    return {
      x: (col + 0.5) * 12.5,
      y: (row + 0.5) * 12.5
    };
  };


  useEffect(() => {
    if (!dragState || !boardRef.current) return;

    const boardElement = boardRef.current;

    const updatePointer = (clientX: number, clientY: number) => {
      const rect = boardElement.getBoundingClientRect();
      setDragState((prev) =>
        prev
          ? {
              ...prev,
              x: clientX - rect.left,
              y: clientY - rect.top
            }
          : null
      );
    };

    const handlePointerMove = (evt: globalThis.PointerEvent) => updatePointer(evt.clientX, evt.clientY);

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [dragState]);

  const previewArrow = useMemo(() => {
    if (!rightDragState || !boardRef.current) return null;
    const from = squareCenter(rightDragState.from);
    return {
      from,
      to: {
        x: (rightDragState.x / boardRef.current.clientWidth) * 100,
        y: (rightDragState.y / boardRef.current.clientHeight) * 100
      }
    };
  }, [rightDragState]);

  return (
    <section className="w-full max-w-[min(92vw,760px)]" aria-label="Échiquier LumiChess">
      <div className="relative rounded-3xl border border-[#c6933d33] bg-gradient-to-b from-[#1b1510] to-[#0d0b08] p-3 shadow-board">
        <div
          ref={boardRef}
          className="relative grid aspect-square w-full grid-cols-8 overflow-hidden rounded-2xl border border-[#d3a55b33]"
          onContextMenu={(evt) => evt.preventDefault()}
          onPointerMove={(evt) => {
            if (!boardRef.current) return;

            if (rightDragState) {
              const rect = boardRef.current.getBoundingClientRect();
              setRightDragState({
                ...rightDragState,
                x: evt.clientX - rect.left,
                y: evt.clientY - rect.top
              });
            }
          }}
          onPointerDown={(evt) => {
            if (evt.button !== 2 || !boardRef.current) return;
            const from = pointerToSquare(evt, boardRef.current, orientation);
            if (!from) return;
            const rect = boardRef.current.getBoundingClientRect();
            evt.currentTarget.setPointerCapture(evt.pointerId);
            setRightDragState({
              from,
              x: evt.clientX - rect.left,
              y: evt.clientY - rect.top
            });
          }}
          onPointerUp={(evt) => {
            if (!boardRef.current) return;

            if (dragState && evt.button === 0) {
              const to = pointerToSquare(evt, boardRef.current, orientation);
              if (to) onPieceDrop(dragState.from, to);
              setDragState(null);
            }

            if (rightDragState && evt.button === 2) {
              const to = pointerToSquare(evt, boardRef.current, orientation);
              if (to) {
                if (to === rightDragState.from) {
                  setMarkedSquares((prev) =>
                    prev.includes(to) ? prev.filter((sq) => sq !== to) : [...prev, to]
                  );
                } else {
                  setArrows((prev) => {
                    const exists = prev.some((arrow) => arrow.from === rightDragState.from && arrow.to === to);
                    if (exists) {
                      return prev.filter((arrow) => !(arrow.from === rightDragState.from && arrow.to === to));
                    }
                    return [...prev, { from: rightDragState.from, to }];
                  });
                }
              }
              setRightDragState(null);
            }
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
            const isMarked = markedSquares.includes(square);
            const targetPiece = pieces.find((piece) => piece.square === square);
            const isCaptureTarget = Boolean(isTarget && targetPiece && targetPiece.color !== turn);

            return (
              <button
                key={square}
                type="button"
                className={clsx(
                  'group relative flex items-center justify-center transition-all duration-200',
                  isLightSquare(square)
                    ? `bg-gradient-to-br ${selectedBoardTheme.lightSquareClass}`
                    : `bg-gradient-to-br ${selectedBoardTheme.darkSquareClass}`
                )}
                onClick={() => onSquareClick(square)}
                aria-label={`Case ${square}`}
              >
                {isLastMove && <span className="pointer-events-none absolute inset-0 bg-[#e3b15e33]" />}
                {isSelected && <span className="pointer-events-none absolute inset-1 rounded-sm border-2 border-[#f1cd8a] shadow-glow" />}
                {isCheck && <span className="pointer-events-none absolute inset-0 bg-[#d84c4c80]" />}
                {isMarked && <span className="pointer-events-none absolute inset-2 rounded-full border-4 border-[#3ea9ffaa]" />}
                {isTarget && !isCaptureTarget && (
                  <span className="pointer-events-none absolute h-4 w-4 rounded-full border border-[#4b3a24aa] bg-[#3e2c18aa] shadow-[0_0_14px_rgba(255,220,155,0.6)]" />
                )}
                {isCaptureTarget && <span className="pointer-events-none absolute inset-[10%] rounded-full border-4 border-[#f6d8a5dd]" />}
                {(row === 7 || row === 0 || col === 0 || col === 7) && (
                  <span className="pointer-events-none absolute inset-0 ring-1 ring-black/5" />
                )}
              </button>
            );
          })}

          <svg className="pointer-events-none absolute inset-0 z-[8]" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <marker id="arrowhead" markerWidth="5" markerHeight="4" refX="4.2" refY="2" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L5,2 L0,4 Z" fill="#57b8ffcc" />
              </marker>
            </defs>
            {arrows.map((arrow) => {
              const from = squareCenter(arrow.from);
              const to = squareCenter(arrow.to);
              return (
                <line
                  key={`${arrow.from}-${arrow.to}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="#57b8ffcc"
                  strokeWidth="1.8"
                  markerEnd="url(#arrowhead)"
                  strokeLinecap="round"
                />
              );
            })}
            {previewArrow && (
              <line
                x1={previewArrow.from.x}
                y1={previewArrow.from.y}
                x2={previewArrow.to.x}
                y2={previewArrow.to.y}
                stroke="#57b8ff88"
                strokeWidth="1.4"
                markerEnd="url(#arrowhead)"
                strokeLinecap="round"
                strokeDasharray="2.5 2"
              />
            )}
          </svg>

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
                className={clsx('absolute z-10 p-1.5 sm:p-2 touch-none', isDragging ? 'z-20 cursor-grabbing' : 'cursor-grab')}
                style={
                  isDragging
                    ? {
                        width,
                        left: `calc(${((dragState?.x ?? 0) / (boardRef.current?.clientWidth ?? 1)) * 100}% - 6.25%)`,
                        top: `calc(${((dragState?.y ?? 0) / (boardRef.current?.clientHeight ?? 1)) * 100}% - 6.25%)`
                      }
                    : { width, left, top }
                }
                animate={isDragging ? { scale: 1.08 } : { left, top, scale: 1 }}
                transition={isDragging ? { duration: 0.08 } : { type: 'spring', stiffness: 360, damping: 28, mass: 0.42 }}
                onPointerDown={(evt) => {
                  if (evt.button !== 0 || !boardRef.current) return;
                  const canMove = onPiecePointerDown(piece.square);
                  if (!canMove) return;
                  const rect = boardRef.current.getBoundingClientRect();
                  evt.currentTarget.setPointerCapture(evt.pointerId);
                  setDragState({
                    from: piece.square,
                    x: evt.clientX - rect.left,
                    y: evt.clientY - rect.top
                  });
                }}
                aria-label={`Pièce ${piece.color === 'w' ? 'blanche' : 'noire'} ${piece.type} sur ${piece.square}`}
              >
                <ChessPiece type={piece.type} color={piece.color} themeId={pieceTheme} isDragging={isDragging} />
              </motion.button>
            );
          })}

          {files.map((file, index) => (
            <span
              key={`${file}-coord`}
              className="pointer-events-none absolute bottom-1 text-[10px] font-medium uppercase tracking-wide text-black/60"
              style={{ left: `${index * 12.5 + 1.3}%` }}
            >
              {file}
            </span>
          ))}

          {ranks.map((rank, index) => (
            <span
              key={`${rank}-coord`}
              className="pointer-events-none absolute right-1 text-[10px] font-medium tracking-wide text-black/60"
              style={{ top: `${index * 12.5 + 1.2}%` }}
            >
              {rank}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between px-1 text-xs text-[#ddc08f]">
        <span>Vue: {orientation === 'w' ? 'Blancs' : 'Noirs'}</span>
        <span>Clic droit: rond/flèche · Drag & drop + clic</span>
      </div>
    </section>
  );
}
