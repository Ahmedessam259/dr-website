/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}', './lib/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0b1e3f',
        navy: '#123a6b',
        royal: '#1d4ed8',
        ice: '#eef4fb',
        mist: '#f6f9fd',
        teal: '#0f9d8f',
        tealbright: '#2dd4bf',
        deep: '#081c36',
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'serif'],
        sans: ['var(--font-cairo)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
