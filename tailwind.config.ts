import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        mxi: {
          ink: '#0b0b0c',
          paper: '#fafafa',
          accent: '#ff5a1f',
        },
      },
    },
  },
  plugins: [],
};

export default config;
