/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        medical: {
          blue: "#0A6CBD",
          "blue-dark": "#095a9d",
          green: "#29B86F",
          "green-dark": "#238f5a",
        },
      },
    },
  },
  plugins: [],
};
