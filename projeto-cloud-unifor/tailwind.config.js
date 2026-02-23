/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        primaryDark: "#0B4AA2",
        primarySoft: "#E8F0FF",
        bgsoft: "#60acf8",
      },
    },
  },
  plugins: [],
};