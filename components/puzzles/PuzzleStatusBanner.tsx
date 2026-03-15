import clsx from 'clsx';
import type { PuzzleSessionState } from '@/types/puzzle';

interface PuzzleStatusBannerProps {
  session: PuzzleSessionState;
}

export function PuzzleStatusBanner({ session }: PuzzleStatusBannerProps) {
  const isSolved = session.status === 'solved';
  const isFailed = session.status === 'failed' || session.status === 'invalid';

  return (
    <div
      className={clsx(
        'rounded-2xl border p-3 text-sm font-medium',
        isSolved && 'border-emerald-500/60 bg-emerald-500/10 text-emerald-200',
        isFailed && 'border-rose-500/60 bg-rose-500/10 text-rose-200',
        !isSolved && !isFailed && 'border-[#c6933d33] bg-[#100d09] text-[#f3dfbd]'
      )}
    >
      {isSolved && <p>🏆 Puzzle réussi. Clique sur <strong>Puzzle suivant</strong>.</p>}
      {isFailed && <p>⚠️ Mauvais coup ou puzzle invalide. Utilise <strong>Réessayer</strong>.</p>}
      {!isSolved && !isFailed && <p>{session.feedback}</p>}
    </div>
  );
}
