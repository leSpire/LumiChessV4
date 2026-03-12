'use client';

import { usePuzzleSession } from '@/hooks/usePuzzleSession';

export function usePuzzleTraining() {
  return usePuzzleSession();
}
