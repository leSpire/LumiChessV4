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
  boardTheme,
  suggestedArrows = [],
  showLegalMoves = true
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
    <section className="w-full max-w-[min(100vw-2rem,820px)]" aria-label="Échiquier LumiChess">
      <div className="relative rounded-[12px] bg-[#262522] p-3 shadow-[0_10px_30px_rgba(0,0,0,0.22)] sm:p-4">
        <div
          ref={boardRef}
          className="relative grid aspect-square w-full grid-cols-8 overflow-hidden rounded-[10px] bg-[#1f1e1b]"
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
            const displayFile = files[col];
            const displayRank = ranks[row];
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
                  'group relative flex items-center justify-center border-0 outline-none transition-colors duration-100 focus-visible:z-[6] focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-inset',
                  isLightSquare(square)
                    ? selectedBoardTheme.lightSquareClass
                    : selectedBoardTheme.darkSquareClass
                )}
                onClick={() => onSquareClick(square)}
                aria-label={`Case ${square}`}
              >
                {isLastMove && <span className="pointer-events-none absolute inset-0 bg-[rgba(255,235,59,0.22)]" />}
                {isSelected && <span className="pointer-events-none absolute inset-0 bg-[rgba(255,215,0,0.28)]" />}
                {isCheck && <span className="pointer-events-none absolute inset-0 bg-[rgba(220,38,38,0.28)]" />}
                {isMarked && <span className="pointer-events-none absolute inset-2 rounded-full border-4 border-[#3ea9ffaa]" />}
                {showLegalMoves && isTarget && !isCaptureTarget && (
                  <span className="pointer-events-none absolute h-[22%] w-[22%] rounded-full bg-[rgba(0,0,0,0.18)] transition-opacity duration-100" />
                )}
                {showLegalMoves && isCaptureTarget && (
                  <span className="pointer-events-none absolute inset-[10%] rounded-full shadow-[inset_0_0_0_6px_rgba(0,0,0,0.18)]" />
                )}
                {col === 0 && (
                  <span
                    className={clsx(
                      'pointer-events-none absolute left-[8%] top-[6%] text-[11px] font-medium leading-none sm:text-xs',
                      isLightSquare(square) ? selectedBoardTheme.lightCoordinateClass : selectedBoardTheme.darkCoordinateClass
                    )}
                  >
                    {displayRank}
                  </span>
                )}
                {row === 7 && (
                  <span
                    className={clsx(
                      'pointer-events-none absolute bottom-[6%] right-[8%] text-[11px] font-medium leading-none sm:text-xs',
                      isLightSquare(square) ? selectedBoardTheme.lightCoordinateClass : selectedBoardTheme.darkCoordinateClass
                    )}
                  >
                    {displayFile}
                  </span>
                )}
              </button>
            );
          })}

          <svg className="pointer-events-none absolute inset-0 z-[8]" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <marker id="arrowhead" markerWidth="5" markerHeight="4" refX="4.2" refY="2" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L5,2 L0,4 Z" fill="#57b8ffcc" />
              </marker>
              <marker id="arrowhead-red" markerWidth="5" markerHeight="4" refX="4.2" refY="2" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L5,2 L0,4 Z" fill="#f87171cc" />
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
            {suggestedArrows.map((arrow, index) => {
              const from = squareCenter(arrow.from);
              const to = squareCenter(arrow.to);
              return (
                <line
                  key={`suggested-${arrow.from}-${arrow.to}-${index}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={arrow.color === 'red' ? '#f87171cc' : '#57b8ffcc'}
                  strokeWidth="1.8"
                  markerEnd={arrow.color === 'red' ? 'url(#arrowhead-red)' : 'url(#arrowhead)'}
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
                className={clsx('absolute z-10 p-[7%] touch-none outline-none', isDragging ? 'z-20 cursor-grabbing' : 'cursor-grab')}
                style={
                  isDragging
                    ? {
                        width,
                        left: `calc(${((dragState?.x ?? 0) / (boardRef.current?.clientWidth ?? 1)) * 100}% - 6.25%)`,
                        top: `calc(${((dragState?.y ?? 0) / (boardRef.current?.clientHeight ?? 1)) * 100}% - 6.25%)`
                      }
                    : { width, left, top }
                }
                animate={isDragging ? { scale: 1.03 } : { left, top, scale: 1 }}
                transition={
                  isDragging
                    ? { duration: 0.08 }
                    : { duration: 0.14, ease: [0.2, 0.8, 0.2, 1] }
                }
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
                <ChessPiece
                  type={piece.type}
                  color={piece.color}
                  themeId={pieceTheme}
                  isDragging={isDragging}
                  isSelected={selectedSquare === piece.square}
                />
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between px-1 text-xs text-[rgba(255,255,255,0.72)]">
        <span>Vue: {orientation === 'w' ? 'Blancs' : 'Noirs'}</span>
        <span>Clic droit: rond/flèche · Drag & drop + clic</span>
      </div>
    </section>
  );
}
