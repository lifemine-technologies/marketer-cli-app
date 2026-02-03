/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './src/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light mode colors
        light: {
          bg: '#ffffff',
          surface: '#f8f9fa',
          card: '#ffffff',
          border: '#e5e7eb',
          text: '#111827',
          textSecondary: '#6b7280',
          primary: '#4f46e5',
          primaryHover: '#4338ca',
          accent: '#f3f4f6',
        },
        // Dark mode colors
        dark: {
          bg: '#0f172a',
          surface: '#1e293b',
          card: '#1e293b',
          border: '#334155',
          text: '#f1f5f9',
          textSecondary: '#94a3b8',
          primary: '#6366f1',
          primaryHover: '#818cf8',
          accent: '#334155',
        },
      },
    },
  },
  plugins: [],
};
