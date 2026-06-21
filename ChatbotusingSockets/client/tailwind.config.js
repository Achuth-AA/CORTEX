/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0f0f13',
        panel: '#1a1a2e',
        sidebar: '#16213e',
        bubble: '#2a2a3e',
        accent: {
          DEFAULT: '#a855f7', // purple-500
          cyan: '#9333ea', // purple-600 (secondary accent)
          violet: '#7e22ce', // purple-700 (gradient end — purple, not blue-violet)
          glow: '#c084fc', // purple-400
        },
      },
      fontFamily: {
        display: ['Syne', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px -4px rgba(168, 85, 247, 0.65)',
        'glow-lg': '0 0 44px -6px rgba(168, 85, 247, 0.8)',
        panel: '0 18px 50px -24px rgba(0,0,0,0.8)',
      },
      keyframes: {
        'bounce-dot': {
          '0%, 80%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '40%': { transform: 'translateY(-6px)', opacity: '1' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(34,197,94,0.6)' },
          '70%': { boxShadow: '0 0 0 6px rgba(34,197,94,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(34,197,94,0)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0,0) scale(1)' },
          '33%': { transform: 'translate(30px,-40px) scale(1.1)' },
          '66%': { transform: 'translate(-20px,20px) scale(0.95)' },
        },
        'gradient-pan': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'bounce-dot': 'bounce-dot 1.4s infinite ease-in-out',
        'pulse-ring': 'pulse-ring 2s infinite',
        blob: 'blob 18s ease-in-out infinite',
        'gradient-pan': 'gradient-pan 8s ease infinite',
      },
    },
  },
  plugins: [],
}
