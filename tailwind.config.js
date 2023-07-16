/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", ...defaultTheme.fontFamily.sans],
        serif: ["Italiana", ...defaultTheme.fontFamily.serif],
      },
      colors: {
        primary: {
          50: "#f1f9fa",
          100: "#ddeff0",
          200: "#bedee3",
          300: "#91c7cf",
          400: "#58a4b1",
          500: "#418b99",
          600: "#397281",
          700: "#335e6b",
          800: "#314f59",
          900: "#2c444d",
        },
        "vyta-secondary": {
          50: "#fcf6f4",
          100: "#faeae6",
          200: "#f7d9d1",
          300: "#f0beb1",
          400: "#e69883",
          500: "#db7f66",
          600: "#c45b3e",
          700: "#a44a31",
          800: "#88402c",
          900: "#72392a",
        },
        "vyta-tertiary": {
          50: "#f7f8f8",
          100: "#e5e6e7",
          200: "#dadcdd",
          300: "#babdbf",
          400: "#94999c",
          500: "#777c80",
          600: "#606569",
          700: "#4f5255",
          800: "#434649",
          900: "#3b3e3f",
        },
      },
    },
  },
  plugins: [require("daisyui"), require("tailwind-gradient-mask-image")],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#58a4b1",
          secondary: "#e69883",
          accent: "#94999c",
          neutral: "#3d4451",
          "base-100": "#ffffff",
        },
      },
    ],
  },
};
