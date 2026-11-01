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
          darkest: '#080E21',
          navy: '#0B132B',
          midnight: '#1C2541',
          card: '#151D36',
          border: '#2A3656',
          primary: '#2563EB',
          accent: '#38BDF8',
          electric: '#3B82F6',
        },
        occupancy: {
          low: '#10B981',
          moderate: '#0284C7',
          high: '#F59E0B',
          nearFull: '#EF4444',
          overcrowded: '#991B1B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
