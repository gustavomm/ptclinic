/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./content/**/*.{md,mdx}",
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
        // #3a7883 was 4.303:1 on surface-alt — failed AA. Darkened so it clears BOTH
        // backgrounds it is used over: 5.56:1 on surface, 5.15:1 on surface-alt.
        accent: "#346b75",
        "accent-deep": "#a8543c",
        "accent-warm": "#db7f66",
        // #db7f66 is only 4.07:1 on ink — fails AA as text. This lighter tint of the
        // same brand colour (the clinic's own vyta-secondary-400) reads 5.16:1.
        // Use accent-warm for backgrounds and rules; accent-warm-soft for text on dark.
        "accent-warm-soft": "#e69883",
        muted: "#5d6664",
        // NOT the comp's #8a8378 (3.48:1 on surface). Tuned to pass AA on BOTH
        // backgrounds it is used over: 5.04:1 on surface, 4.66:1 on surface-alt.
        subtle: "#6F695F",
      },
      fontSize: {
        "display-xl": ["clamp(2.5rem, 1.5rem + 4.5vw, 5.25rem)", { lineHeight: "1.02", fontWeight: "300" }],
        "display-lg": ["clamp(2rem, 1.3rem + 3.2vw, 3.75rem)", { lineHeight: "1.05", fontWeight: "300" }],
        "display-md": ["clamp(1.75rem, 1.3rem + 1.8vw, 2.75rem)", { lineHeight: "1.15", fontWeight: "300" }],
        "display-sm": ["clamp(1.375rem, 1.15rem + 1vw, 2rem)", { lineHeight: "1.15", fontWeight: "400" }],
      },
      letterSpacing: { eyebrow: "0.28em", brand: "0.32em", hero: "0.46em" },
      maxWidth: { shell: "80rem" },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
