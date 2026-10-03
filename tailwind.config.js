/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  // "class" (rather than "media") lets `useThemeStore` drive dark/light mode
  // explicitly via NativeWind's `colorScheme.set()`, instead of following the
  // OS appearance setting. See `src/theme/useThemeStore.ts`.
  darkMode: 'class',
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        accent: {
          sky: '#0284c7',
          skyLight: '#38bdf8',
          electric: '#0ea5e9',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
        },
      },
    },
  },
  plugins: [],
}

