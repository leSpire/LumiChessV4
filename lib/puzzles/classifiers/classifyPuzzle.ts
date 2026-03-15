import type { PuzzleCategory, PuzzleTheme } from '@/types/puzzle';

const LICHESS_THEME_MAP: Record<string, PuzzleTheme | undefined> = {
  mateIn1: 'mateIn1',
  mateIn2: 'mateIn2',
  mateIn3: 'mateIn3',
  fork: 'fork',
  pin: 'pin',
  skewer: 'skewer',
  discoveredAttack: 'discoveredAttack',
  doubleAttack: 'doubleAttack',
  attraction: 'attraction',
  deflection: 'deflection',
  promotion: 'promotion',
  endgame: 'endgameTechnique'
};

export function mapLichessThemes(themeString: string): PuzzleTheme[] {
  const themes = themeString
    .split(/[\s,]+/)
    .map((theme) => theme.trim())
    .filter(Boolean)
    .map((theme) => LICHESS_THEME_MAP[theme])
    .filter((theme): theme is PuzzleTheme => Boolean(theme));

  return [...new Set(themes)];
}

export function classifyPrimaryCategory(themes: PuzzleTheme[]): PuzzleCategory {
  if (themes.some((theme) => theme.startsWith('mateIn'))) return 'mate';
  if (themes.includes('endgameTechnique') || themes.includes('promotion')) return 'endgame';
  return 'tactic';
}

export function buildPuzzleTitle(themes: PuzzleTheme[], rating: number): string {
  if (themes.includes('mateIn1')) return `Mat immédiat · ${rating}`;
  if (themes.includes('mateIn2')) return `Forçage en 2 · ${rating}`;
  if (themes.includes('fork')) return `Fourchette tactique · ${rating}`;
  if (themes.includes('endgameTechnique')) return `Finale active · ${rating}`;
  return `Puzzle tactique · ${rating}`;
}
