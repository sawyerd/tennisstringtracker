import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#2D6A4F',
          light: '#E8F5EE',
          muted: '#52976E',
        },
        canvas: '#F8F7F4',
        ink: '#1A1A2E',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.07)',
        'card-hover': '0 4px 20px rgba(0,0,0,0.11)',
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
}

export default config
