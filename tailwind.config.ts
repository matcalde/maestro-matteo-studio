import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        secondary: "#7C3AED",
        socratic: "#F59E0B",
        interviews: "#DC2626",
        inclusive: "#10B981",
        bg: { light: "#FAFAF9", dark: "#0A0A0A" },
        surface: { light: "#FFFFFF", dark: "#171717" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        read: ["'Atkinson Hyperlegible'", "Inter", "sans-serif"],
        dys: ["'OpenDyslexic'", "'Atkinson Hyperlegible'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      borderRadius: { xl: "12px" },
      maxWidth: { app: "1200px" },
    },
  },
  plugins: [],
} satisfies Config;
