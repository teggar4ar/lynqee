import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Mobile-first responsive breakpoints
      screens: {
        'xs': '375px',  // Small phones
        'sm': '640px',  // Large phones
        'md': '768px',  // Tablets
        'lg': '1024px', // Desktop
        'xl': '1280px', // Large desktop
        '2xl': '1536px' // Extra large desktop
      },
      // Touch-friendly sizing
      spacing: {
        '11': '2.75rem',   // 44px - minimum touch target
        '13': '3.25rem',   // 52px - comfortable touch target
      },
      // Mobile-optimized typography
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      },
      // App-specific color palette
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
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
        },
        // Added new nature-inspired palette
        'mint-cream': '#f2f7f5',
        'forest-green': '#00473e',
        'sage-gray': '#475d5b',
        'golden-yellow': '#d97706',
        'yellow': '#faae2b',
        'deep-forest': '#00332c',
        'coral-pink': '#ffa8ba',
        'coral-red': '#fa5246',
      },
      // Enhanced border radius for modern design
      borderRadius: {
        ...defaultTheme.borderRadius,
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.25rem',
      },
      // Custom animations for modern loading components
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in-from-top-2': 'slideInFromTop 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 1s infinite',
        // Include default animations
        'spin': 'spin 1s linear infinite',
        'ping': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 1s infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInFromTop: {
          '0%': { transform: 'translateY(-0.5rem)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-0.25rem)' },
        },
        // Include default keyframes
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
        ping: {
          '75%, 100%': { transform: 'scale(2)', opacity: '0' },
        },
        pulse: {
          '50%': { opacity: '.5' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(-25%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
          '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
        },
      },
    },
  },
  plugins: [
    // Plugin for line-clamp utility
    function({ addUtilities }) {
      addUtilities({
        '.line-clamp-1': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-line-clamp': '1',
          'line-clamp': '1',
          '-webkit-box-orient': 'vertical',
        },
        '.line-clamp-2': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-line-clamp': '2',
          'line-clamp': '2',
          '-webkit-box-orient': 'vertical',
        },
        '.line-clamp-3': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-line-clamp': '3',
          'line-clamp': '3',
          '-webkit-box-orient': 'vertical',
        },
      })
    }
  ],
}
