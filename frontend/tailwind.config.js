/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Source Sans 3"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#122033',
        canvas: '#f4f6f8',
        line: '#e4e7ec',
        pine: '#1f6f5b',
      },
    },
  },
  plugins: [],
};
