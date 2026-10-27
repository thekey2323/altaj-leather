import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FCFCF9",
          100: "#F8F7F2", // Master soft cream background
          200: "#F2EFE8",
          300: "#E8E3DA",
        },
        ivory: {
          50: "#FFFEFC",
          100: "#FDFCF7", // Warm ivory card
          200: "#F7F5EC",
        },
        sage: {
          50: "#F3F7F5",
          100: "#E5EFEA",
          200: "#CFDFD6",
          300: "#B0CBBF",
          400: "#8BAF9C", // Master sage primary
          500: "#749B86",
          600: "#5D826E",
          700: "#486657",
        },
        terracotta: {
          50: "#FAF3F0",
          100: "#F5E4DE",
          200: "#ECCAC0",
          300: "#DCABA0",
          400: "#C98770", // Master muted terracotta
          500: "#B8725B",
          600: "#9E5944",
        },
        lavender: {
          50: "#F7F6FD",
          100: "#EDEBF9",
          200: "#DDD8F4",
          300: "#C9C2E8", // Master soft lavender
          400: "#ABA1D9",
          500: "#8E82C7",
        },
        paleblue: {
          50: "#F4F8FB",
          100: "#E7F1F7",
          200: "#D3E5F0",
          300: "#BCD8E8", // Master pale blue
          400: "#9FC4DC",
          500: "#7DAECB",
        },
        softpeach: {
          50: "#FCF8F5",
          100: "#F9EDE7",
          200: "#F5DFD5",
          300: "#F2D4C5", // Master soft peach
          400: "#E5BAA6",
        },
        charcoal: {
          50: "#F6F7F6",
          100: "#E3E5E4",
          200: "#C5C9C6",
          300: "#9DA39E",
          500: "#5A615C",
          700: "#3E4440",
          800: "#303632", // Master dark charcoal text
          900: "#222724",
        },
        altaj: {
          bg: "#F8F7F2", // Ivoire / crème doux
          sand: "#EEE7DD",
          pure: "#FFFFFF",
          dark: "#303632",
          brown: "#5A4031",
          taupe: "#9A7761",
          gold: "#B89563",
          goldDark: "#9A784B",
          text: "#303632",
          muted: "#6E7570",
          borderLight: "#E8E5DC",
          borderDark: "#3A322C",
        },
      },
      fontFamily: {
        serif: ["'Cinzel'", "'Playfair Display'", "Georgia", "serif"],
        arabic: ["'IBM Plex Sans Arabic'", "'Tajawal'", "sans-serif"],
        sans: ["'Plus Jakarta Sans'", "'IBM Plex Sans Arabic'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(32, 33, 36, 0.05)",
        card: "0 8px 30px -4px rgba(32, 33, 36, 0.06)",
        float: "0 12px 36px -6px rgba(32, 33, 36, 0.12)",
        coral: "0 8px 24px -4px rgba(224, 90, 71, 0.25)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};
export default config;

