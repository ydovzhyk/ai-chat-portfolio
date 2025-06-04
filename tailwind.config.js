/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },

      screens: {
        'custom-lg': '1110px',
      },

      zIndex: {
        60: '60',
        70: '70',
        100: '100',
      },

      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '3rem',
          xl: '4rem',
          '2xl': '4rem',
          '3xl': '5rem',
        },
      },

      keyframes: {
        pulseCustom: {
          '0%': {
            transform: 'scale(1)',
            boxShadow: '0 0 0 0 rgba(236, 72, 153, 0.4)',
          },
          '50%': {
            transform: 'scale(1)',
            boxShadow: '0 0 0 20px rgba(236, 72, 153, 0.1)',
          },
          '70%': {
            transform: 'scale(1)',
            boxShadow: '0 0 0 20px rgba(236, 72, 153, 0)',
          },
          '100%': {
            transform: 'scale(1)',
            boxShadow: '0 0 0 0 rgba(236, 72, 153, 0)',
          },
        },
        shakeCustom: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
      },
      animation: {
        pulseCustom: 'pulseCustom 2.5s infinite',
        shakeCustom: 'shakeCustom 0.4s infinite',
      },

      extend: {
        screens: {
          '4k': '1980px',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
