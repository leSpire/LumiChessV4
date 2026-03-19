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
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/58 backdrop-blur-[2px]">
      <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-[#302e2b] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.42)]">
        <p className="mb-3 text-sm font-medium text-[#f5f5f5]">Choisir la promotion</p>
        <div className="grid grid-cols-4 gap-2">
          {promotionPieces.map((piece) => (
            <button
              key={piece}
              type="button"
              className="aspect-square rounded-xl border border-white/8 bg-[#3c3a37] p-2 transition duration-100 hover:border-white/20 hover:bg-[#46433f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
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
