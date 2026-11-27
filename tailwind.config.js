/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}', './lib/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        navy: 'rgb(var(--c-navy) / <alpha-value>)',
        royal: 'rgb(var(--c-royal) / <alpha-value>)',
        ice: 'rgb(var(--c-ice) / <alpha-value>)',
        mist: 'rgb(var(--c-mist) / <alpha-value>)',
        teal: 'rgb(var(--c-teal) / <alpha-value>)',
        tealbright: 'rgb(var(--c-tealbright) / <alpha-value>)',
        deep: 'rgb(var(--c-deep) / <alpha-value>)',
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'serif'],
        sans: ['var(--font-cairo)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
