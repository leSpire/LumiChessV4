export interface BoardTheme {
  id: string;
  label: string;
  lightSquareClass: string;
  darkSquareClass: string;
  lightCoordinateClass: string;
  darkCoordinateClass: string;
}

export const BOARD_THEMES: BoardTheme[] = [
  {
    id: 'lumi-classic',
    label: 'Lumi Classic',
    lightSquareClass: 'bg-[#f0d9b5]',
    darkSquareClass: 'bg-[#b58863]',
    lightCoordinateClass: 'text-[rgba(52,39,27,0.72)]',
    darkCoordinateClass: 'text-[rgba(255,248,234,0.72)]'
  },
  {
    id: 'midnight',
    label: 'Midnight Blue',
    lightSquareClass: 'bg-[#d8e1f2]',
    darkSquareClass: 'bg-[#506c92]',
    lightCoordinateClass: 'text-[rgba(31,45,68,0.72)]',
    darkCoordinateClass: 'text-[rgba(240,246,255,0.72)]'
  },
  {
    id: 'emerald',
    label: 'Emerald',
    lightSquareClass: 'bg-[#eeeed2]',
    darkSquareClass: 'bg-[#769656]',
    lightCoordinateClass: 'text-[rgba(48,61,30,0.72)]',
    darkCoordinateClass: 'text-[rgba(248,252,235,0.72)]'
  },
  {
    id: 'obsidian',
    label: 'Obsidian',
    lightSquareClass: 'bg-[#d8d8d8]',
    darkSquareClass: 'bg-[#4a4a4a]',
    lightCoordinateClass: 'text-[rgba(40,40,40,0.72)]',
    darkCoordinateClass: 'text-[rgba(248,248,248,0.72)]'
  }
];

export function getBoardTheme(themeId: string): BoardTheme {
  return BOARD_THEMES.find((theme) => theme.id === themeId) ?? BOARD_THEMES[0];
}
