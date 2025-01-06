/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4a5568',
        secondary: '#718096',
        accent: '#f6ad55'
      },
      fontFamily: {
        sans: ['Inter var', 'sans-serif']
      }
    }
  },
  plugins: []
}
