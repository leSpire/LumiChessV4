'use client';

import type { Color, PieceSymbol } from 'chess.js';
import clsx from 'clsx';

interface ChessPieceProps {
  type: PieceSymbol;
  color: Color;
  isDragging?: boolean;
}

const baseClasses = 'h-full w-full drop-shadow-[0_6px_8px_rgba(0,0,0,0.45)]';

function PieceFrame({ children, color }: { children: React.ReactNode; color: Color }) {
  const white = color === 'w';

  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={baseClasses}>
      <defs>
        <linearGradient id={`piece-gradient-${white ? 'w' : 'b'}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={white ? '#FEF7E8' : '#5B4A33'} />
          <stop offset="100%" stopColor={white ? '#D6BA88' : '#1B1610'} />
        </linearGradient>
      </defs>
      {children}
    </svg>
  );
}

export function ChessPiece({ type, color, isDragging }: ChessPieceProps) {
  const fill = `url(#piece-gradient-${color})`;
  const stroke = color === 'w' ? '#4D3A23' : '#CBA56B';

  const shared = {
    fill,
    stroke,
    strokeWidth: 3.2,
    strokeLinejoin: 'round' as const,
    strokeLinecap: 'round' as const
  };

  return (
    <div className={clsx('relative h-full w-full transition-transform duration-150', isDragging && 'scale-110')}>
      <PieceFrame color={color}>
        {type === 'p' && <path {...shared} d="M50 20c8 0 14 6 14 14s-6 14-14 14-14-6-14-14 6-14 14-14Zm-16 50h32l-4-16H38l-4 16Zm-8 14h48v-8H26v8Z" />}
        {type === 'r' && <path {...shared} d="M28 18h10v10h8V18h8v10h8V18h10v16H28V18Zm8 20h28l-4 18H40l-4-18Zm-6 42h40v-8H30v8Z" />}
        {type === 'n' && <path {...shared} d="M34 78h38v-8H34v8Zm0-12h28l4-14-14-8 8-10-8-8-18 10v8l8 4-8 18Z" />}
        {type === 'b' && <path {...shared} d="M50 16c5 0 9 4 9 9s-4 9-9 9-9-4-9-9 4-9 9-9Zm-4 22h8l10 30H36l10-30Zm-12 42h32v-8H34v8Z" />}
        {type === 'q' && (
          <path
            {...shared}
            d="M22 26c4 0 7 3 7 7a7 7 0 1 1-7-7Zm56 0c4 0 7 3 7 7a7 7 0 1 1-7-7ZM50 16c4 0 7 3 7 7a7 7 0 1 1-14 0c0-4 3-7 7-7Zm-24 26h48l-8 26H34l-8-26Zm-2 38h52v-8H24v8Z"
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
