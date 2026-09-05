/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#f97316', // Vibrant modern orange like chessplay
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        board: {
          light: '#f0d9b5',
          dark: '#b58863',
          highlight: 'rgba(247, 209, 87, 0.65)',
          check: 'rgba(239, 68, 68, 0.8)',
          selected: 'rgba(99, 102, 241, 0.6)',
        },
        surface: {
          DEFAULT: '#18181b',
          elevated: '#27272a',
          card: '#1e1e24',
          border: '#3f3f46',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 25px -5px rgba(249, 115, 22, 0.3)',
      }
    },
  },
  plugins: [],
}
