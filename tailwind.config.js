/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        warmwhite: "#FFFBF7",
        rose: {
          DEFAULT: "#E8B4B8",
          light: "#F3D1D4",
          dark: "#D19498",
        },
        ink: {
          DEFAULT: "#2D2A32",
          light: "#5D5A65",
          pale: "#A09DA8",
        },
        mint: {
          DEFAULT: "#A8D5BA",
          dark: "#7FBF99",
        },
        amber: {
          DEFAULT: "#F5C77E",
          dark: "#E8B055",
        },
      },
      fontFamily: {
        sans: [
          "Noto Sans SC",
          "PingFang SC",
          "Microsoft YaHei",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 8px 32px rgba(139, 109, 113, 0.08)",
        card: "0 4px 20px rgba(139, 109, 113, 0.06)",
        pressed: "0 2px 8px rgba(139, 109, 113, 0.1)",
      },
      borderRadius: {
        capsule: "999px",
      },
      animation: {
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "success-pop": "successPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      },
      keyframes: {
        pulseSoft: {
          "0%, 100%": { opacity: 1, transform: "scale(1)" },
          "50%": { opacity: 0.85, transform: "scale(1.02)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        successPop: {
          "0%": { transform: "scale(0)", opacity: 0 },
          "60%": { transform: "scale(1.1)", opacity: 1 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
