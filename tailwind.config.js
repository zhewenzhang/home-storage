/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          light: 'rgb(var(--color-primary-light) / <alpha-value>)',
          dark: 'rgb(var(--color-primary-dark) / <alpha-value>)',
          bg: 'rgb(var(--color-primary-bg) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: '#8FBC8F', // Sage Green for accents
          light: '#B6D7B6',
        },
        accent: {
          DEFAULT: '#FFA07A', // Soft Salmon
          hover: '#FF8C61',
        },
        surface: {
          DEFAULT: '#F8F9FA', // Cool White
          warm: '#FFFDF9',     // Warm White
          card: '#FFFFFF',
        },
        text: {
          main: '#2D3748',
          muted: '#718096',
          light: '#A0AEC0',
        }
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 15px rgba(59, 109, 140, 0.3)',
        'card': '0 2px 12px -2px rgba(0, 0, 0, 0.03), 0 8px 24px -4px rgba(0, 0, 0, 0.02)',
      },
      fontFamily: {
        sans: ['Nunito', 'Inter', 'system-ui', 'sans-serif'], // Rounder, friendlier font
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
