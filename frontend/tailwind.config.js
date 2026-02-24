/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pikpak: {
          blue: '#1677ff',
          dark: '#0d1117',
          panel: '#161b22',
          border: '#30363d',
        }
      }
    },
  },
  plugins: [],
}
