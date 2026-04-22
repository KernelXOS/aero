import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dae6ff",
          200: "#bcd1ff",
          300: "#8db1ff",
          400: "#5f88fb",
          500: "#3b64f0",
          600: "#2748d6",
          700: "#2139ab",
          800: "#1f3389",
          900: "#1e2f6d",
          950: "#141c44",
        },
        accent: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "brand-gradient":
          "linear-gradient(135deg, #2748d6 0%, #3b64f0 45%, #06b6d4 100%)",
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(15, 23, 42, 0.18)",
        panel:
          "0 20px 45px -20px rgba(15, 23, 42, 0.35), 0 8px 20px -12px rgba(15, 23, 42, 0.15)",
        ring: "0 0 0 4px rgba(59, 100, 240, 0.18)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pingSoft: {
          "0%": { transform: "scale(1)", opacity: "0.45" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.35s ease-out both",
        shimmer: "shimmer 2.2s linear infinite",
        pingSoft: "pingSoft 1.8s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
    },
  },
  plugins: [],
};
export default config;
