/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#F5F7FA',
        'bg-card': 'rgba(255,255,255,0.85)',
        'accent-mint': '#B5EAD7',
        'accent-peach': '#FFDAC1',
        'accent-blue': '#C7CEEA',
        'accent-lavender': '#E2F0CB',
        'accent-coral': '#FFB7B2',
        'text-primary': '#2D3748',
        'text-secondary': '#718096',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        'xl': '12px',
      },
      backdropBlur: {
        'md': '12px',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
