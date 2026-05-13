import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          // Deep evergreen ("Koho-evolved" dark base)
          DEFAULT: "#0E3D24",
          primary: "#0E3D24",
          deep: "#0A2818",
          forest: "#155235",
          // Electric lime accent
          accent: "#D9FF4E",
          accentSoft: "#E9FF8E",
          // Warm cream surfaces
          cream: "#F5F1E8",
          creamSoft: "#FAF7F0",
          // Neutrals
          ink: "#0A2818",
          surface: "#FFFFFF",
          muted: "#6B7280",
          line: "#E7E2D6",
          lineDark: "#1E5238",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-bricolage)",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: [
          "var(--font-bricolage)",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(10,40,24,0.06), 0 8px 24px rgba(10,40,24,0.06)",
        cardDark: "0 1px 2px rgba(0,0,0,0.2), 0 12px 32px rgba(0,0,0,0.18)",
        glow: "0 0 0 6px rgba(217,255,78,0.25)",
      },
      maxWidth: {
        prose: "72ch",
      },
      borderRadius: {
        pill: "9999px",
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      fontSize: {
        display: ["clamp(2.75rem, 7vw, 6rem)", { lineHeight: "0.95", letterSpacing: "-0.02em" }],
        hero: ["clamp(2.25rem, 5.5vw, 4.75rem)", { lineHeight: "1.02", letterSpacing: "-0.015em" }],
        section: ["clamp(1.75rem, 3.5vw, 3rem)", { lineHeight: "1.05", letterSpacing: "-0.01em" }],
      },
    },
  },
  plugins: [],
};

export default config;
