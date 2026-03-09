import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './hooks/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        lumi: {
          bg: '#080808',
          panel: '#12100D',
          accent: '#C6933D',
          accentSoft: '#7A5D2A',
          lightSquare: '#F0DFC1',
          darkSquare: '#8C6A3D'
        }
      },
      boxShadow: {
        board: '0 24px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,226,174,0.08), inset 0 -1px 0 rgba(255,226,174,0.04)',
        glow: '0 0 0 1px rgba(198,147,61,0.38), 0 0 22px rgba(198,147,61,0.24)'
      }
    }
  },
  plugins: []
};

export default config;
