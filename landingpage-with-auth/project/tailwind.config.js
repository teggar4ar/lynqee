/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // UI Elements
        'mint-cream': '#f2f7f5',
        'forest-green': '#00473e',
        'sage-gray': '#475d5b',
        'golden-yellow': '#faae2b',
        // Illustrations/Graphics
        'deep-forest': '#00332c',
        'coral-pink': '#ffa8ba',
        'coral-red': '#fa5246',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      lineHeight: {
        'body': '1.5',
        'heading': '1.2',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
};