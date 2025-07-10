/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        'mansfield': ['Mansfield', 'sans-serif'],
      },
      fontSize: {
        base: "18px", // default is 16px
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [],
};
