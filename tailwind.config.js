/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx,scss}"
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color)',
        secondary: 'var(--secondary-color)',
        background: 'var(--background-color)',
      },
      opacity: {
        '90': '0.9'
      },
      backgroundColor: {
        'primary/90': 'rgba(var(--primary-color-rgb), 0.9)'
      }
    },
  },
  safelist: [
    'bg-primary',
    'hover:bg-primary/90',
    'text-primary',
    'border-primary',
    {
      pattern: /(bg|text|border)-(primary|secondary|background)/,
      variants: ['hover', 'focus', 'active']
    }
  ],
  plugins: [],
}