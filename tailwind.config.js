/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#473BCE",
          hover: "#3B30A8",
          light: "#F3F2FF",
          "light-hover": "#E8E5FF",
          border: "#E1DEFC",
          gradient: {
            from: "#5246D8",
            to: "#473BCE",
          },
        },
        surface: "#FFFFFF",
        background: "#FAFAFA",
        "text-primary": "#141415",
        "text-secondary": "#717075",
        "text-muted": "#9C9CA0",
        border: "#E8E8EA",
        "border-hover": "#DBDBDC",
        error: {
          DEFAULT: "#E85D75",
          bg: "#FFF0F2",
          border: "#FECDD3",
        },
        warning: {
          text: "#92400E",
          bg: "#FFFBEB",
          border: "#FDE68A",
        },
      },
      fontFamily: {
        sans: [
          "TT Norms Pro Expanded",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        display: [
          "TT Norms Pro Expanded",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04), 0 6px 16px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};
