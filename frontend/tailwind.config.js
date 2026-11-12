/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        finance: {
          bg: '#0B0F19',
          card: '#111827',
          border: '#1F2937',
          hover: '#1E293B',
          up: '#10B981',
          down: '#EF4444',
          accent: '#3B82F6',
          gold: '#F59E0B'
        }
      }
    },
  },
  plugins: [],
}
