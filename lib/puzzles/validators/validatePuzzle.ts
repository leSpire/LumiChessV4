import { Chess, type PieceSymbol, type Square } from 'chess.js';
import type { PuzzleRecord, PuzzleValidationResult } from '@/types/puzzle';

const normalizeUci = (uci: string) => uci.trim().toLowerCase();

const toUci = (from: Square, to: Square, promotion?: PieceSymbol) => `${from}${to}${promotion ?? ''}`.toLowerCase();

function isValidUciFormat(uci: string): boolean {
  return /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(uci);
}

export function validatePuzzle(puzzle: PuzzleRecord): PuzzleValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const minimumLength = puzzle.objective === 'mate' && puzzle.themes.includes('mateIn1') ? 1 : 2;
  if (puzzle.solutionLine.length < minimumLength) {
    errors.push(`La solution est trop courte (minimum ${minimumLength} demi-coups).`);
  }

  let chess: Chess;
  try {
    chess = new Chess(puzzle.startFen);
  } catch {
    return {
      valid: false,
      errors: ['FEN invalide.'],
      warnings
    };
  }

  if (chess.turn() !== puzzle.playerToMove) {
    errors.push('Le camp au trait est incohérent avec la FEN.');
  }

  if (!puzzle.solutionLine.length) {
    errors.push('La ligne de solution est vide.');
  }

  puzzle.solutionLine.forEach((step, index) => {
    const expectedActor = chess.turn();
    const uci = normalizeUci(step.uci);

    if (step.actor !== expectedActor) {
      errors.push(`Acteur incohérent au coup ${index + 1} (${step.actor} attendu ${expectedActor}).`);
      return;
    }

    if (!isValidUciFormat(uci)) {
      errors.push(`Format UCI invalide au coup ${index + 1}: ${uci}.`);
      return;
    }

    const legalMove = chess
      .moves({ verbose: true })
      .find((move) => toUci(move.from, move.to, move.promotion) === uci);

    if (!legalMove) {
      errors.push(`Coup illégal au coup ${index + 1}: ${uci}.`);
      return;
    }

    chess.move(legalMove);
  });

  if (errors.length === 0) {
    if (puzzle.objective === 'mate' && !chess.isCheckmate()) {
      errors.push("Objectif 'mate' annoncé mais la position finale n'est pas un mat.");
    }

    if (puzzle.objective === 'materialGain' && chess.isStalemate()) {
      warnings.push("La ligne se termine par pat pour un puzzle de gain matériel (à vérifier).");
    }

    if (puzzle.objective === 'promotion' && !puzzle.solutionLine.some((move) => move.uci.length === 5)) {
      errors.push("Objectif 'promotion' annoncé sans coup de promotion dans la ligne.");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export function isMoveMatchingExpectedUci(
  from: Square,
  to: Square,
  expectedUci: string,
  promotion?: PieceSymbol
): boolean {
  return toUci(from, to, promotion) === normalizeUci(expectedUci);
}
