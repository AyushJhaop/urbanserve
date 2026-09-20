import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette - context-appropriate, no generic blue/purple
        primary: {
          DEFAULT: '#E07855', // Warm Terracotta - trust and warmth
          light: '#F39C7C',
          dark: '#C85F3F',
        },
        secondary: {
          DEFAULT: '#8FBC8F', // Fresh Sage - growth and reliability
          light: '#A8D3A8',
          dark: '#6B9F6B',
        },
        accent: {
          DEFAULT: '#FF8C42', // Sunset Orange - energy and action
          light: '#FFB07B',
          dark: '#E66B1F',
        },
        neutral: {
          dark: '#2C3E50', // Charcoal
          DEFAULT: '#6C757D',
          light: '#E8E8E3',
          lighter: '#F5F5F0', // Warm Gray
        },
        success: '#6B8E23', // Moss Green
        warning: '#FFA500', // Amber
        error: '#C84A3F', // Brick Red
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Open Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['4.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        'display-md': ['3.5rem', { lineHeight: '1.2', fontWeight: '700' }],
        'display-sm': ['2.5rem', { lineHeight: '1.2', fontWeight: '600' }],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 20px -2px rgba(0, 0, 0, 0.1), 0 15px 30px -3px rgba(0, 0, 0, 0.08)',
        'strong': '0 10px 40px -3px rgba(0, 0, 0, 0.15), 0 20px 50px -5px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
    },
  },
  plugins: [],
};

export default config;
