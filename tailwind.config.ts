import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        void: {
          0: "#080808",
          1: "#0D0D0D",
          2: "#121212",
          3: "#181818",
          4: "#242424",
        },
        ivory: "#F4F1EA",
        mist: "#A8A49C",
        stone: "#6E6A64",
      },
      fontFamily: {
        display: ["var(--font-unbounded)", "sans-serif"],
        serif: ["var(--font-cormorant)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      letterSpacing: {
        brand: "0.42em",
        editorial: "0.22em",
        wide: "0.16em",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.22, 1, 0.36, 1)",
        cinematic: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        400: "400ms",
        700: "700ms",
        900: "900ms",
        1200: "1200ms",
      },
    },
  },
  plugins: [],
};

export default config;
