/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "#3a3a3a",
        input: "#3a3a3a",
        ring: "#8b956d",
        background: "#1a1a1a",
        foreground: "#e0e0e0",
        primary: {
          DEFAULT: "#8b956d",
          foreground: "#1a1a1a",
        },
        secondary: {
          DEFAULT: "#2a2a2a",
          foreground: "#e0e0e0",
        },
        destructive: {
          DEFAULT: "#8b4444",
          foreground: "#e0e0e0",
        },
        muted: {
          DEFAULT: "#2a2a2a",
          foreground: "#a0a0a0",
        },
        accent: {
          DEFAULT: "#8b956d",
          foreground: "#1a1a1a",
        },
        popover: {
          DEFAULT: "#2a2a2a",
          foreground: "#e0e0e0",
        },
        card: {
          DEFAULT: "#2a2a2a",
          foreground: "#e0e0e0",
        },
        // Tactical Military Colors
        tactical: {
          green: '#8b956d',
          olive: '#4a7c59',
          red: '#8b4444',
          amber: '#d4a574',
          blue: '#5a7a8a',
          gold: '#c9a050',
        },
        // Background Colors
        bg: {
          dark: '#1a1a1a',
          card: '#2a2a2a',
          border: '#3a3a3a',
        },
        // Text Colors
        text: {
          primary: '#e0e0e0',
          secondary: '#a0a0a0',
          disabled: '#666666',
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        xl: "0.75rem",
        lg: "0.375rem",
        md: "0.375rem",
        sm: "0.25rem",
        xs: "0.25rem",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        sm: "0 4px 12px rgba(0, 0, 0, 0.4)",
        md: "0 8px 24px rgba(0, 0, 0, 0.6)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "1" },
          "100%": { transform: "scale(1.2)", opacity: "0" },
        },
        "scan": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "expand-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "typing": {
          "from": { width: "0" },
          "to": { width: "100%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scan": "scan 3s linear infinite",
        "expand-in": "expand-in 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-in-up": "slide-in-up 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "typing": "typing 1.5s steps(20, end)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}