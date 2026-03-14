'use client';

import { usePuzzleSession } from '@/hooks/puzzles/usePuzzleSession';

export function usePuzzleTraining() {
  return usePuzzleSession();
}
