'use client';

import type { Color, PieceSymbol } from 'chess.js';
import clsx from 'clsx';

interface ChessPieceProps {
  type: PieceSymbol;
  color: Color;
  isDragging?: boolean;
}

const baseClasses = 'h-full w-full drop-shadow-[0_7px_10px_rgba(0,0,0,0.5)]';

function PieceFrame({ children, color }: { children: React.ReactNode; color: Color }) {
  const white = color === 'w';

  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={baseClasses}>
      <defs>
        <radialGradient id={`piece-main-${white ? 'w' : 'b'}`} cx="40%" cy="28%" r="72%">
          <stop offset="0%" stopColor={white ? '#fff9ec' : '#7f6844'} />
          <stop offset="55%" stopColor={white ? '#e8cf9f' : '#3d2f1f'} />
          <stop offset="100%" stopColor={white ? '#c19a63' : '#1a130d'} />
        </radialGradient>
      </defs>
      {children}
    </svg>
  );
}

export function ChessPiece({ type, color, isDragging }: ChessPieceProps) {
  const fill = `url(#piece-main-${color})`;
  const stroke = color === 'w' ? '#523a1f' : '#d8b073';

  const shared = {
    fill,
    stroke,
    strokeWidth: 3,
    strokeLinejoin: 'round' as const,
    strokeLinecap: 'round' as const
  };

  return (
    <div className={clsx('relative h-full w-full transition-transform duration-150', isDragging && 'scale-110')}>
      <PieceFrame color={color}>
        {type === 'p' && <path {...shared} d="M50 19c8 0 14 6 14 14s-6 14-14 14-14-6-14-14 6-14 14-14Zm-15 50h30l-3-16H38l-3 16Zm-9 14h48v-8H26v8Z" />}
        {type === 'r' && <path {...shared} d="M27 19h10v10h8V19h10v10h8V19h10v16H27V19Zm10 20h26l-4 18H41l-4-18Zm-6 42h38v-8H31v8Z" />}
        {type === 'n' && <path {...shared} d="M34 79h37v-8H34v8Zm0-12h27l4-15-13-8 8-10-8-8-18 10v8l8 4-8 19Z" />}
        {type === 'b' && <path {...shared} d="M50 16c5 0 9 4 9 9s-4 9-9 9-9-4-9-9 4-9 9-9Zm-4 22h8l9 30H37l9-30Zm-11 42h30v-8H35v8Z" />}
        {type === 'q' && (
          <path
            {...shared}
            d="M22 26c4 0 7 3 7 7a7 7 0 1 1-7-7Zm56 0c4 0 7 3 7 7a7 7 0 1 1-7-7ZM50 15c4 0 7 3 7 7a7 7 0 1 1-14 0c0-4 3-7 7-7Zm-24 27h48l-8 26H34l-8-26Zm-2 38h52v-8H24v8Z"
          />
        )}
        {type === 'k' && (
          <path
            {...shared}
            d="M48 12h4v10h10v4H52v12h-4V26H38v-4h10V12Zm-14 34h32l-4 20H38l-4-20Zm-8 34h48v-8H26v8Z"
          />
        )}
      </PieceFrame>
    </div>
  );
}
