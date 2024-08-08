/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        "se-green": "#0B3931",
        "se-lime": "#C4FE33",
        "se-jungle": "#1A9E78"
      },
    },
  },
  plugins: [],
}
