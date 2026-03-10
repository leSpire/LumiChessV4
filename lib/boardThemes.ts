export interface BoardTheme {
  id: string;
  label: string;
  lightSquareClass: string;
  darkSquareClass: string;
}

export const BOARD_THEMES: BoardTheme[] = [
  {
    id: 'lumi-classic',
    label: 'Lumi Classic',
    lightSquareClass: 'from-[#f2e0be] to-[#d3b88e]',
    darkSquareClass: 'from-[#8a6439] to-[#6a4a2b]'
  },
  {
    id: 'midnight',
    label: 'Midnight Blue',
    lightSquareClass: 'from-[#c8d5ef] to-[#a7b7d9]',
    darkSquareClass: 'from-[#2e466d] to-[#1f3353]'
  },
  {
    id: 'emerald',
    label: 'Emerald',
    lightSquareClass: 'from-[#d5ead5] to-[#b8d7b8]',
    darkSquareClass: 'from-[#3d6a4f] to-[#2a4b37]'
  },
  {
    id: 'obsidian',
    label: 'Obsidian',
    lightSquareClass: 'from-[#d7d7d7] to-[#b9b9b9]',
    darkSquareClass: 'from-[#434343] to-[#2a2a2a]'
  }
];

export function getBoardTheme(themeId: string): BoardTheme {
  return BOARD_THEMES.find((theme) => theme.id === themeId) ?? BOARD_THEMES[0];
}
