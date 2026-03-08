import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: "#1FA3A3",
          50:  "#f0fafa",
          100: "#ccf0f0",
          200: "#99e1e1",
          300: "#66d1d1",
          400: "#33c2c2",
          500: "#1FA3A3",
          600: "#198282",
          700: "#136262",
          800: "#0d4141",
          900: "#062121",
        },
        navy: { DEFAULT: "#0F172A", light: "#1E293B" },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "DM Sans", "system-ui", "sans-serif"],
      },
      borderRadius: { "2xl": "1rem", "3xl": "1.5rem" },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 16px rgba(0,0,0,0.08)",
        modal: "0 20px 60px rgba(0,0,0,0.18)",
      },
      animation: {
        "slide-up": "slideUp 0.3s cubic-bezier(0.175,0.885,0.32,1.275)",
        shimmer: "shimmer 1.4s ease infinite",
      },
      keyframes: {
        slideUp: {
          from: { transform: "translateY(20px)", opacity: "0" },
          to:   { transform: "translateY(0)",    opacity: "1" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
