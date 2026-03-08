/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern Safety-themed palette (2026)
        primary: {
          50: '#f0f7ff',
          100: '#e0efff',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#1e40af',  // Core blue
          600: '#1e3a8a',  // Dark blue
          700: '#1d3557',  // Navy
          800: '#0f172a',  // Very dark
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#dc2626',
        critical: '#991b1b',
        neutral: '#f8fafc',
        // New accent colors for depth
        accent: {
          cyan: '#06b6d4',
          indigo: '#6366f1',
          violet: '#a855f7',
        },
      },
      boxShadow: {
        // Modern glassmorphism shadows
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-lg': '0 20px 60px 0 rgba(31, 38, 135, 0.3)',
        'glass-sm': '0 4px 15px 0 rgba(31, 38, 135, 0.2)',
        'depth': '0 10px 40px -15px rgba(0, 0, 0, 0.3)',
        'depth-lg': '0 20px 60px -20px rgba(0, 0, 0, 0.4)',
      },
      backdropBlur: {
        'glass': 'blur(10px)',
        'glass-lg': 'blur(20px)',
      },
      backdropFilter: {
        'glass': 'blur(10px)',
      },
      backgroundImage: {
        'gradient-safety': 'linear-gradient(135deg, #1e40af 0%, #06b6d4 100%)',
        'gradient-warm': 'linear-gradient(135deg, #1e40af 0%, #f59e0b 100%)',
        'gradient-hero': 'linear-gradient(135deg, #0f172a 0%, #1e40af 50%, #06b6d4 100%)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(30, 64, 175, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(30, 64, 175, 0.8)' },
        },
      },
    },
  },
}
