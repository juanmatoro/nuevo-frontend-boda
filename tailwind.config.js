/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true, // Agrega !important a cada clase
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "480px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        xl2: "1536px",
        xl3: "1920px",
      },
      colors: {
        principal: "#47D7AC", // Color sin niveles
        secundario: "#6CF59D",
        accent: "#E63946",
        neutral: "#E9ECEF",
      },
    },
  },
  plugins: [],
};
