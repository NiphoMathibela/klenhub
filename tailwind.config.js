/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1D4ED8', // Example primary color
        'primary-dark': '#1E40AF', // Darker shade for hover effects
        'yellow': {
          400: '#FBBF24', // Yellow color for text
          500: '#F59E0B', // Button background
          600: '#D97706', // Darker yellow for hover
        },
        gray: {
          800: '#1F2937', // Dark gray for footer background
          600: '#4B5563', // Medium gray for text
        },
      },
    },
  },
  plugins: [],
};
