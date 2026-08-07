/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./content/**/*.{md,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        surface: "#FAF6F0",
        "surface-alt": "#F3EDE4",
        line: "#E3DCD2",
        ink: "#2C3A3D",
        "ink-deep": "#1A2224",
        accent: "#3a7883",
        "accent-deep": "#a8543c",
        "accent-warm": "#db7f66",
        muted: "#5d6664",
        // NOT the comp's #8a8378 — that is 3.48:1 on surface and fails WCAG AA.
        subtle: "#746E64",
      },
      fontSize: {
        "display-xl": ["clamp(2.5rem, 1.5rem + 4.5vw, 5.25rem)", { lineHeight: "1.02", fontWeight: "300" }],
        "display-lg": ["clamp(2rem, 1.3rem + 3.2vw, 3.75rem)", { lineHeight: "1.05", fontWeight: "300" }],
        "display-md": ["clamp(1.75rem, 1.3rem + 1.8vw, 2.75rem)", { lineHeight: "1.15", fontWeight: "300" }],
        "display-sm": ["clamp(1.375rem, 1.15rem + 1vw, 2rem)", { lineHeight: "1.15", fontWeight: "400" }],
      },
      letterSpacing: { eyebrow: "0.28em", brand: "0.32em", hero: "0.46em" },
      maxWidth: { shell: "80rem" },
    },
  },
  plugins: [require("daisyui")],
  daisyui: { themes: [{ mytheme: { primary: "#3a7883", secondary: "#db7f66", accent: "#94999c", neutral: "#2C3A3D", "base-100": "#FAF6F0" } }] },
};
