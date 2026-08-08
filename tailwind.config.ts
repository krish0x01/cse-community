import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          950: "#040711",
          900: "#080b14",
          850: "#0c101d",
          800: "#111728",
          750: "#172036",
          700: "#1e293b",
          600: "#334155",
        },
        neon: {
          cyan: "#00f2fe",
          "cyan-bright": "#22d3ee",
          "cyan-dark": "#0891b2",
          purple: "#c084fc",
          "purple-bright": "#d946ef",
          "purple-dark": "#7e22ce",
        },
        cyan: {
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
        },
        purple: {
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "-apple-system", "sans-serif"],
        mono: ["var(--font-geist-mono)", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.4)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.3)",
        "card-hover": "0 12px 32px -4px rgba(6, 182, 212, 0.15), 0 4px 16px -2px rgba(168, 85, 247, 0.15)",
        cyan: "0 0 20px -2px rgba(34, 211, 238, 0.45)",
        "cyan-lg": "0 0 35px 2px rgba(34, 211, 238, 0.6)",
        purple: "0 0 20px -2px rgba(192, 132, 252, 0.45)",
        "purple-lg": "0 0 35px 2px rgba(192, 132, 252, 0.6)",
        neon: "0 0 25px -3px rgba(34, 211, 238, 0.3), 0 0 25px -3px rgba(192, 132, 252, 0.3)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out forwards",
        "slide-up": "slideUp 0.35s ease-out forwards",
        "pulse-glow": "pulseGlow 2.5s infinite ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.02)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
