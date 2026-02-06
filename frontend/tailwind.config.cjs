module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    fontFamily: {
      poppins: ['Poppins', 'Inter', 'sans-serif'],
      inter: ['Inter', 'sans-serif'],
    },
    extend: {
      colors: {
        'hs-green': '#a8e6cf',
        'hs-blue': '#dcedc1',
        'hs-soft-pink': '#ffd3b6',
        'hs-soft-light': '#fff',
        'hs-card': '#f4f9f4'
      },
      boxShadow: {
        card: '0 2px 12px 0 rgb(174 190 209 / 10%)'
      }
    },
  },
  plugins: [],
};