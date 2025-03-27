import type { Config } from "tailwindcss";

// Screen breakpoints configuration
const screens = {
  xs: "475px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

// Color palette configuration
const colors = {
  primary: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9",
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c4a6e",
  },
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },
};

// Container configuration
const container = {
  center: true,
  padding: {
    DEFAULT: "1rem",
    sm: "2rem",
    lg: "4rem",
    xl: "5rem",
    "2xl": "6rem",
  },
  screens,
};

// Animation configuration
const animations = {
  keyframes: {
    fadeIn: {
      "0%": { opacity: "0" },
      "100%": { opacity: "1" },
    },
    slideUp: {
      "0%": { transform: "translateY(20px)", opacity: "0" },
      "100%": { transform: "translateY(0)", opacity: "1" },
    },
    shake: {
      "0%, 100%": { transform: "translateX(0)" },
      "25%": { transform: "translateX(-4px)" },
      "75%": { transform: "translateX(4px)" },
    },
  },
  animation: {
    "fade-in": "fadeIn 0.5s ease-in",
    "slide-up": "slideUp 0.5s ease-out",
    shake: "shake 0.5s ease-in-out",
  },
};

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{html,js,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    screens,
    extend: {
      colors,
      fontFamily: {
        sans: ["Inter", "Noto Sans Arabic", "sans-serif"],
      },
      spacing: {
        "128": "32rem",
        "144": "36rem",
      },
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
        content: "1200px",
      },
      container,
      ...animations,
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
  ],
};

export default config;
