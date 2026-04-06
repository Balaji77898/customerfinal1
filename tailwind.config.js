/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep Maroon Primary - Headers, sidebars, and primary branding
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#B03030',
          600: '#9B2B2B',
          700: '#8B1D1D', // Deep Maroon (Primary)
          800: '#6B1515',
          900: '#4B0F0F',
          DEFAULT: '#8B1D1D',
          light: "#9B2B2B",
          dark: "#6B1515",
        },
        // Rich Gold - Primary buttons (CTA), icons, and highlights
        gold: {
          50: '#fffdf0',
          100: '#fffae0',
          200: '#fff5c2',
          300: '#ffed99',
          400: '#ffe066',
          500: '#F4C430', // Rich Gold (Secondary)
          600: '#d9a820',
          700: '#b88a15',
          800: '#946d10',
          900: '#6b4f0a',
          DEFAULT: '#F4C430',
          dark: "#D9A820",
        },
        // Soft Cream - Main page background (easier on eyes than pure white)
        ivory: {
          50: '#FFFFFF',
          100: '#FAF9F6', // Soft Cream (Background)
          200: '#f5f3ed',
          300: '#f0ede3',
          DEFAULT: '#FAF9F6',
        },
        // Charcoal - Main body text and headings for high readability
        text: {
          dark: '#1C1C1C', // Charcoal
          DEFAULT: '#1C1C1C',
        },
        // Accent - Vibrant Coral/Rose
        accent: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          DEFAULT: '#f43f5e',
          purple: '#8b5cf6',
          blue: '#3b82f6',
          teal: '#14b8a6',
          amber: '#f59e0b',
          emerald: '#10b981',
        },
        // Surface/Background colors
        surface: {
          DEFAULT: "#FFFFFF",
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          dark: '#0f172a',
          darker: '#020617',
        },
        // Status colors
        success: {
          light: '#dcfce7',
          DEFAULT: '#22c55e',
          dark: '#15803d',
        },
        warning: {
          light: '#fef3c7',
          DEFAULT: '#f59e0b',
          dark: '#b45309',
        },
        danger: {
          light: '#fee2e2',
          DEFAULT: '#ef4444',
          dark: '#b91c1c',
        },
        info: {
          light: '#dbeafe',
          DEFAULT: '#3b82f6',
          dark: '#1d4ed8',
        },
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '1rem',
        xl: '1.25rem',
        '2xl': '2rem',
        '3xl': '2.5rem',
        full: '9999px',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 40px -10px rgba(155, 43, 43, 0.4)',
        'glow-strong': '0 0 40px -10px rgba(176, 48, 48, 0.9)',
        'glow-gold': '0 0 40px -10px rgba(200, 169, 81, 0.7)',
        'glow-accent': '0 0 40px -10px rgba(244, 63, 94, 0.5)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'elevated': '0 10px 40px -10px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
