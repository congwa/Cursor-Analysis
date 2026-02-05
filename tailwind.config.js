/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // GitHub Dark / OLED Dark 主色调
        background: "#0d1117",
        foreground: "#e6edf3",
        card: {
          DEFAULT: "#161b22",
          foreground: "#e6edf3",
        },
        popover: {
          DEFAULT: "#1c2128",
          foreground: "#e6edf3",
        },
        primary: {
          DEFAULT: "#58a6ff",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#21262d",
          foreground: "#8b949e",
        },
        muted: {
          DEFAULT: "#21262d",
          foreground: "#8b949e",
        },
        accent: {
          DEFAULT: "#238636",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#f85149",
          foreground: "#ffffff",
        },
        border: "#30363d",
        input: "#21262d",
        ring: "#58a6ff",
        // 功能色
        success: "#238636",
        warning: "#d29922",
        info: "#58a6ff",
        agent: "#a371f7",
        chat: "#79c0ff",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      fontFamily: {
        sans: ["Fira Sans", "system-ui", "sans-serif"],
        mono: ["Fira Code", "monospace"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
