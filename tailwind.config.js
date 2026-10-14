/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        'brand-navy': '#2b4162',
        'brand-blue': '#2260ff',
        'brand-mint': '#d2f4ea',
        'brand-dark-start': 'rgb(20, 30, 48)',
        'brand-dark-end': 'rgb(36, 59, 85)',
      },
      fontFamily: {
        display: ['Anton', 'sans-serif'],
        brand: ['Crete Round', 'serif'],
      },
    },
  },
  plugins: [],
};
