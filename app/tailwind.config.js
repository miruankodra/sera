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

        // Desktop dashboard design system (introduced on the greenhouse detail
        // page, shared across all lg: dashboard layouts for consistency).
        "dash-bg":          "oklch(98% 0.004 240)",
        "dash-border":      "oklch(91% 0.005 240)",
        "dash-border-soft": "oklch(93% 0.005 240)",
        "dash-text":        "oklch(22% 0.01 240)",
        "dash-text2":       "oklch(50% 0.01 240)",
        "dash-muted":       "oklch(60% 0.01 240)",
        "dash-dim":         "oklch(65% 0.01 240)",

        "dash-green":      "oklch(55% 0.15 155)",
        "dash-green-bg":   "oklch(93% 0.05 155)",
        "dash-green-text": "oklch(42% 0.13 155)",

        "dash-red":    "oklch(55% 0.19 25)",
        "dash-red-bg": "oklch(94% 0.05 25)",

        "dash-amber":    "oklch(65% 0.14 75)",
        "dash-amber-bg": "oklch(95% 0.06 75)",

        "dash-off": "oklch(88% 0.005 240)",
      },
      animation: {
        pulse: 'pulse 0.6s ease-in-out',
        bounce: 'bounce 0.6s linear',
        ripple: 'ripple 0.6s linear',
        rotate: 'rotate 0.6s linear',
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
        rotate: {
          '0%': { transform: 'rotate(0deg)' },
          '50%, 100%': { transform: 'rotate(90deg)' }
        },
      }
    },
  },
  plugins: [],
}
