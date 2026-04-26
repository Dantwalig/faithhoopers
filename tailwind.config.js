/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['var(--font-barlow)', 'system-ui', 'sans-serif'],
        display: ['var(--font-barlow-condensed)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-space-mono)', 'monospace'],
      },
      colors: {
        brand: {
          black:  '#1a1a1a',
          coal:   '#2e2e2e',
          grey:   '#4a4a4a',
          silver: '#9a9a9a',
          cream:  '#f5f2ee',
          white:  '#ffffff',
          orange: '#e8600a',
          'orange-light': '#f97316',
          'orange-pale':  '#fff0e6',
        },
        court: {
          50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa',
          400: '#fb923c', 500: '#f97316', 600: '#ea580c',
          700: '#c2410c', 800: '#9a3412', 900: '#7c2d12',
        },
        spirit: {
          50: '#f0fdf4', 100: '#dcfce7', 500: '#22c55e',
          600: '#16a34a', 700: '#15803d', 900: '#14532d',
        },
        ink: {
          50: '#f8f7f4', 100: '#f0ede7', 200: '#e2ddd4',
          300: '#c4bdb5', 400: '#a09890', 600: '#6b6560',
          700: '#4f4a46', 800: '#312e2b', 900: '#1c1a18',
        },
      },
      fontSize: {
        '8xl':  ['6rem',   { lineHeight: '1' }],
        '9xl':  ['8rem',   { lineHeight: '1' }],
        '10xl': ['10rem',  { lineHeight: '1' }],
      },
      letterSpacing: {
        widest: '0.25em',
        'ultra': '0.4em',
      },
    },
  },
  plugins: [],
}