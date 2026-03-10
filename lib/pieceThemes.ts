import type { Color, PieceSymbol } from 'chess.js';

export interface PieceTheme {
  id: string;
  label: string;
  source: string;
  license: string;
  url: string;
}

export const PIECE_THEMES: PieceTheme[] = [
  {
    id: 'classic',
    label: 'Lumi Classic (interne)',
    source: 'LumiChess',
    license: 'Interne',
    url: ''
  },
  {
    id: 'cburnett',
    label: 'Cburnett',
    source: 'lichess-org/lila',
    license: 'AGPL-3.0',
    url: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett'
  },
  {
    id: 'merida',
    label: 'Merida',
    source: 'lichess-org/lila',
    license: 'AGPL-3.0',
    url: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/merida'
  },
  {
    id: 'alpha',
    label: 'Alpha',
    source: 'lichess-org/lila',
    license: 'AGPL-3.0',
    url: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/alpha'
  },
  {
    id: 'pirouetti',
    label: 'Pirouetti',
    source: 'lichess-org/lila',
    license: 'AGPL-3.0',
    url: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/pirouetti'
  },
  {
    id: 'chessnut',
    label: 'Chessnut',
    source: 'lichess-org/lila',
    license: 'AGPL-3.0',
    url: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/chessnut'
  },
  {
    id: 'chess7',
    label: 'Chess7',
    source: 'lichess-org/lila',
    license: 'AGPL-3.0',
    url: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/chess7'
  },
  {
    id: 'reillycraig',
    label: 'ReillyCraig',
    source: 'lichess-org/lila',
    license: 'AGPL-3.0',
    url: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/reillycraig'
  },
  {
    id: 'companion',
    label: 'Companion',
    source: 'lichess-org/lila',
    license: 'AGPL-3.0',
    url: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/companion'
  },
  {
    id: 'riohacha',
    label: 'Riohacha',
    source: 'lichess-org/lila',
    license: 'AGPL-3.0',
    url: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/riohacha'
  },
  {
    id: 'kosal',
    label: 'Kosal',
    source: 'lichess-org/lila',
    license: 'AGPL-3.0',
    url: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/kosal'
  }
];

const symbolMap: Record<PieceSymbol, string> = {
  p: 'P',
  r: 'R',
  n: 'N',
  b: 'B',
  q: 'Q',
  k: 'K'
};

export function getPieceTheme(themeId: string): PieceTheme {
  return PIECE_THEMES.find((theme) => theme.id === themeId) ?? PIECE_THEMES[0];
}

export function getPieceAssetUrl(themeId: string, color: Color, type: PieceSymbol): string | null {
  const theme = getPieceTheme(themeId);
  if (!theme.url) return null;
  const colorPrefix = color === 'w' ? 'w' : 'b';
  return `${theme.url}/${colorPrefix}${symbolMap[type]}.svg`;
}
