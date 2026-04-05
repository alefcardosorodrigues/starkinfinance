/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0d141f",
        primary: {
          DEFAULT: "#adc6ff",
          container: "#2b4478", // Hand-picked derived color
          glow: "rgba(173, 198, 255, 0.2)",
        },
        secondary: {
          DEFAULT: "#4edea3",
          container: "#1e5c41", // Hand-picked derived color
          glow: "rgba(78, 222, 163, 0.2)",
        },
        tertiary: {
          DEFAULT: "#ffb3b6",
        },
        surface: {
          lowest: "#080e1a",
          dim: "#0d141f",
          DEFAULT: "#161c28",
          bright: "#333946",
          container: {
            low: "#1b212d",
            DEFAULT: "#212734",
            high: "#2b313e",
            highest: "#363c4a",
          },
        },
      },
      borderRadius: {
        md: "12px",
      },
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
      },
      boxShadow: {
        ambient: "0 12px 32px rgba(255, 255, 255, 0.06)",
        'neon-primary': "0 0 15px 0 rgba(173, 198, 255, 0.2)",
        'neon-secondary': "0 0 15px 0 rgba(78, 222, 163, 0.2)",
      },
      backgroundImage: {
        "primary-gradient": "linear-gradient(135deg, #adc6ff 0%, #2b4478 100%)",
        "secondary-gradient": "linear-gradient(135deg, #4edea3 0%, #1e5c41 100%)",
        "glass-gradient": "linear-gradient(45deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 100%)",
      },
    },
  },
  plugins: [],
}
