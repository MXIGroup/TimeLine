import type { Config } from 'tailwindcss';

/**
 * Rossi Food design tokens.
 * Bright lime green primary with soft pastel secondary accents.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        lime: {
          // Brand lime green ramp
          50: '#f4fce3',
          100: '#e9f9c7',
          200: '#d6f29a',
          300: '#bfe96a',
          400: '#a5dd3a',
          500: '#84cc16', // primary brand
          600: '#65a30d',
          700: '#4d7c0f',
        },
        rossi: {
          yellow: '#fde68a',
          pink: '#fbcfe8',
          blue: '#bae6fd',
          mint: '#a7f3d0',
          lavender: '#ddd6fe',
          orange: '#fed7aa',
          ink: '#1a2e05',
          paper: '#ffffff',
          bg: '#f3f4f6',
        },
      },
      maxWidth: {
        app: '430px',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'pop-in': {
          '0%': { transform: 'scale(0.96)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'check-pop': {
          '0%': { transform: 'scale(0.8)' },
          '60%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
        'fade-up': {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'pop-in': 'pop-in 0.18s ease-out',
        'check-pop': 'check-pop 0.25s ease-out',
        'fade-up': 'fade-up 0.3s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
