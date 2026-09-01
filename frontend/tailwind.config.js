/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          900: '#0a192f',
          800: '#0f2b48',
          700: '#1b3b6f',
          600: '#214e8a',
          500: '#2b6cb0',
          400: '#3182ce',
          100: '#ebf8ff',
        },
        safety: {
          green: '#10b981',
          yellow: '#f59e0b',
          red: '#ef4444',
        }
      }
    },
  },
  plugins: [],
}
