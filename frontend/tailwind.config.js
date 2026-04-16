/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#f0eeff',
          100: '#e0ddff',
          200: '#c5bfff',
          300: '#a89bff',
          400: '#8b76ff',
          500: '#7c3aed',
          600: '#6d28d9',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#2e1065',
        },
        accent: {
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        surface: {
          DEFAULT: '#0f0f1a',
          50:  '#1a1a2e',
          100: '#16213e',
          200: '#0f3460',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'radial-gradient(at 40% 20%, hsla(263,100%,70%,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,70%,0.05) 0px, transparent 50%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(124, 58, 237, 0.6), 0 0 80px rgba(124, 58, 237, 0.2)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(124, 58, 237, 0.3)',
        'glow-md': '0 0 30px rgba(124, 58, 237, 0.4)',
        'glow-lg': '0 0 60px rgba(124, 58, 237, 0.3)',
        'glass':   '0 8px 32px rgba(0, 0, 0, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
