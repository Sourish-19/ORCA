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
        'surface': '#0d141d',
        'surface-dim': '#0d141d',
        'surface-bright': '#333a44',
        'surface-container-lowest': '#080f17',
        'surface-container-low': '#151c25',
        'surface-container': '#192029',
        'surface-container-high': '#232a34',
        'surface-container-highest': '#2e353f',
        'on-surface': '#dce3f0',
        'on-surface-variant': '#bcc9cd',
        'outline': '#869397',
        'outline-variant': '#3d494c',
        'surface-tint': '#4cd7f6',
        'primary': '#4cd7f6',
        'on-primary': '#003640',
        'primary-container': '#06b6d4',
        'on-primary-container': '#00424f',
        'secondary': '#adc6ff',
        'secondary-container': '#0566d9',
        'tertiary': '#4edea3',
        'tertiary-container': '#1bbd85',
        'error': '#ffb4ab',
        'error-container': '#93000a',
        'on-error-container': '#ffdad6',
        'background': '#0d141d',
        'ocean': {
          950: '#070e1c',
          900: '#0d141d',
          800: '#151c25',
          700: '#192029',
          600: '#232a34',
          500: '#4cd7f6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Inter', 'monospace'],
      }
    },
  },
  plugins: [],
}
