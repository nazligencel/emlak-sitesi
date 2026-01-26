/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a1a2e', // Deep Navy Blue (from Logo Background)
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#E5C05E', // Lighter, True Gold (Less Orange)
          foreground: '#000000',
        },
        accent: {
          DEFAULT: '#D4AF37', // Gold
          foreground: '#1a1a2e',
        },
        muted: {
          DEFAULT: '#f1f5f9', // Slate 100
          foreground: '#64748b', // Slate 500
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

