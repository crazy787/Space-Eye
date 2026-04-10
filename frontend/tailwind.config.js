/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        space: {
          900: '#0B0D17',
          800: '#12152B',
          700: '#1A1F3A',
          600: '#242A4A',
          500: '#2E355B',
        },
        nebula: {
          400: '#7C6AEF',
          500: '#6C5CE7',
          600: '#5A4BD1',
        },
        aurora: {
          400: '#55E6C1',
          500: '#00D2D3',
          600: '#01A3A4',
        },
        solar: {
          400: '#FECA57',
          500: '#FF9F43',
          600: '#EE5A24',
        },
        cosmic: {
          400: '#FF6B81',
          500: '#FF4757',
          600: '#D63031',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.6s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(108, 92, 231, 0.4)' },
          '100%': { boxShadow: '0 0 25px rgba(108, 92, 231, 0.8)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
