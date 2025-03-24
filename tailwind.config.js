/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx,scss}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0084ff',
          50: '#e6f3ff',
          100: '#bfe0ff',
          200: '#99cdff',
          300: '#66b3ff',
          400: '#3399ff',
          500: '#0084ff',
          600: '#0066cc',
          700: '#004d99',
          800: '#003366',
          900: '#001a33',
        },
        secondary: 'var(--secondary-color)',
        background: 'var(--background-color)',
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
      spacing: {
        '4.5': '1.125rem', // 18px
        '1.5': '0.375rem', // 6px
      },
      opacity: {
        '90': '0.9',
        10: '0.1',
      },
      backgroundColor: {
        'primary/90': 'rgba(var(--primary-color-rgb), 0.9)'
      },
      fontSize: {
        '10': '0.625rem', // 为text-[10px]添加正式的类名
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