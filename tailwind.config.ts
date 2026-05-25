import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bull: {
          black: '#0a0c0a',
          panel: '#13171a',
          panel2: '#1b2127',
          green: '#22e36b',
          greenDim: '#0f7a3a',
          red: '#ff2d4b',
          redDim: '#8f1224',
          gold: '#ffd23f',
          chalk: '#eef2ee',
          mute: '#7c8a82',
        },
      },
      fontFamily: {
        display: ['"Arial Black"', 'Impact', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glowGreen: '0 0 24px rgba(34,227,107,0.45)',
        glowRed: '0 0 24px rgba(255,45,75,0.45)',
        glowGold: '0 0 28px rgba(255,210,63,0.5)',
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(0.4)', opacity: '0' },
          '40%': { transform: 'scale(1.25)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        floatUp: {
          '0%': { transform: 'translateY(0) scale(0.8)', opacity: '0' },
          '20%': { transform: 'translateY(-10px) scale(1.1)', opacity: '1' },
          '100%': { transform: 'translateY(-90px) scale(1)', opacity: '0' },
        },
        shake: {
          '0%,100%': { transform: 'translate(0,0)' },
          '20%': { transform: 'translate(-6px,4px)' },
          '40%': { transform: 'translate(6px,-4px)' },
          '60%': { transform: 'translate(-4px,-3px)' },
          '80%': { transform: 'translate(4px,3px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(40px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(110%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        spinWheel: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(var(--spin-to))' },
        },
        pulseRing: {
          '0%,100%': { transform: 'scale(1)', opacity: '0.9' },
          '50%': { transform: 'scale(1.18)', opacity: '0.4' },
        },
        sweep180: {
          '0%': { transform: 'scale(0.2) rotate(-12deg)', opacity: '0' },
          '30%': { transform: 'scale(1.15) rotate(3deg)', opacity: '1' },
          '70%': { transform: 'scale(1) rotate(-2deg)', opacity: '1' },
          '100%': { transform: 'scale(1.05) rotate(0deg)', opacity: '0' },
        },
        flyIn: {
          '0%': { transform: 'translateY(60vh) scale(0.3)', opacity: '0.2' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
      },
      animation: {
        pop: 'pop 0.35s ease-out both',
        floatUp: 'floatUp 1s ease-out forwards',
        shake: 'shake 0.4s ease-in-out',
        slideUp: 'slideUp 0.3s ease-out both',
        slideInRight: 'slideInRight 0.35s cubic-bezier(0.2,0.9,0.3,1.2) both',
        pulseRing: 'pulseRing 1.1s ease-in-out infinite',
        sweep180: 'sweep180 1.6s ease-out forwards',
        flyIn: 'flyIn 0.28s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
