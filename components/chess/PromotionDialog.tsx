'use client';

import type { Color, PieceSymbol } from 'chess.js';
import { ChessPiece } from '@/components/chess/ChessPiece';

const promotionPieces: PieceSymbol[] = ['q', 'r', 'b', 'n'];

interface PromotionDialogProps {
  color: Color;
  onSelect: (piece: PieceSymbol) => void;
}

export function PromotionDialog({ color, onSelect }: PromotionDialogProps) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-xs rounded-2xl border border-[#c6933d5c] bg-[#120f0c] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
        <p className="mb-3 text-sm font-medium text-[#e5cfaa]">Choisir la promotion</p>
        <div className="grid grid-cols-4 gap-2">
          {promotionPieces.map((piece) => (
            <button
              key={piece}
              type="button"
              className="aspect-square rounded-xl border border-[#c6933d4d] bg-[#1a150f] p-2 transition hover:border-[#e3b15e]"
              onClick={() => onSelect(piece)}
              aria-label={`Promouvoir en ${piece}`}
            >
              <ChessPiece type={piece} color={color} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
