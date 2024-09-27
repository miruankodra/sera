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
        "se-jungle": "#1A9E78",
        "se-dimWhite": "rgba(255, 255, 255, 0.7)",
      },
      animation: {
        pulse: 'pulse 0.6s ease-in-out',
        bounce: 'bounce 0.6s linear',
        ripple: 'ripple 0.6s linear',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' }
        },
        ripple: {
          '0%': {
            transform: 'scale(0)',
            opacity: '0.75',
          },
          '100%': {
            transform: 'scale(4)',
            opacity: '0',
          },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20%)' }
        },
      }
    },
  },
  plugins: [],
}
