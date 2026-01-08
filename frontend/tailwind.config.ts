import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pixel: {
          'bg-dark': '#0a0a12',
          'bg-blue': '#1a1a4e',
          primary: '#00d4ff',
          secondary: '#ff6b35',
          success: '#39ff14',
          danger: '#ff073a',
          gold: '#ffd700',
          text: '#e0e0e0',
          muted: '#6b7280',
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        arcade: ['"VT323"', 'monospace'],
      },
      boxShadow: {
        'pixel-sm': '2px 2px 0 0 currentColor',
        'pixel': '4px 4px 0 0 currentColor',
        'pixel-lg': '6px 6px 0 0 currentColor',
        'glow-cyan': '0 0 10px #00d4ff, 0 0 20px #00d4ff40',
        'glow-green': '0 0 10px #39ff14, 0 0 20px #39ff1440',
        'glow-red': '0 0 10px #ff073a, 0 0 20px #ff073a40',
        'glow-gold': '0 0 10px #ffd700, 0 0 20px #ffd70040',
      },
      animation: {
        'flicker': 'flicker 0.15s infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.95' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 10px currentColor, 0 0 20px currentColor' },
          '50%': { boxShadow: '0 0 15px currentColor, 0 0 30px currentColor' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

