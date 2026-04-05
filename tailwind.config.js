/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brown: '#5f3b24',
        sand: '#d8be8a',
        forest: '#1f4f35',
        clay: '#a45a3f',
        cream: '#f6efde',
        moss: '#6a8249',
        sun: '#e8b34a',
      },
      fontFamily: {
        headline: ['"Bree Serif"', 'Georgia', 'serif'],
        body: ['"Nunito Sans"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        floatIn: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        floatIn: 'floatIn 600ms ease forwards',
        slideLeft: 'slideLeft 36s linear infinite',
      },
      boxShadow: {
        glass: '0 12px 30px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
};
