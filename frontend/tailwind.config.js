/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'background': '#0d141d',
        'surface': '#0d141d',
        'surface-container-lowest': '#080f17',
        'surface-container-low': '#151c25',
        'surface-container': '#192029',
        'surface-container-high': '#232a34',
        'surface-container-highest': '#2e353f',
        'surface-bright': '#333a44',
        'primary': '#4cd7f6',
        'primary-container': '#06b6d4',
        'primary-fixed': '#acedff',
        'secondary': '#adc6ff',
        'secondary-container': '#0566d9',
        'tertiary': '#4edea3',
        'tertiary-container': '#1bbd85',
        'error': '#ffb4ab',
        'error-container': '#93000a',
        'on-surface': '#dce3f0',
        'on-surface-variant': '#bcc9cd',
        'on-primary': '#003640',
        'on-secondary': '#002e6a',
        'on-tertiary': '#003824',
        'outline': '#869397',
        'outline-variant': '#3d494c',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Inter', 'monospace'],
      },
      spacing: {
        'hud-gap': '8px',
        'gutter': '16px',
        'card-padding': '12px',
        'container-padding': '24px',
      }
    },
  },
  plugins: [],
}
