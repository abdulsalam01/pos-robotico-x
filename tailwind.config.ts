import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#0b1021",
          800: "#111827",
          700: "#1f2937",
          600: "#374151",
          500: "#6b7280"
        },
        primary: {
          500: "#7c3aed",
          600: "#6d28d9",
          700: "#5b21b6"
        },
        mint: {
          500: "#10b981",
          600: "#059669"
        },
        coral: {
          500: "#f97316",
          600: "#ea580c"
        }
      },
      boxShadow: {
        soft: "0 20px 40px -20px rgba(15, 23, 42, 0.35)",
        card: "0 20px 50px -35px rgba(15, 23, 42, 0.45)"
      }
    }
  },
  plugins: []
};

export default config;
