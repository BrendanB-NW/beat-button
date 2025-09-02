/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Earthy purple tones
        'earth-purple': {
          50: '#f7f4f9',
          100: '#ede5f2',
          200: '#dcc7e3',
          300: '#c19fcf',
          400: '#a071b5',
          500: '#7d4a8b',   // Primary purple
          600: '#6a3d78',
          700: '#583264',
          800: '#4a2b54',
          900: '#3d2547',
        },
        // Warm ochre/amber tones
        'earth-ochre': {
          50: '#fdf8f1',
          100: '#faeede',
          200: '#f4d9b8',
          300: '#ebc088',
          400: '#dfa255',
          500: '#d18c34',   // Primary ochre
          600: '#b7752a',
          700: '#965f26',
          800: '#7a4c25',
          900: '#654022',
        },
        // Earthy sage green tones
        'earth-green': {
          50: '#f4f7f4',
          100: '#e6ede6',
          200: '#ceddce',
          300: '#a6c4a8',
          400: '#7aa37d',
          500: '#5a8660',   // Primary green
          600: '#486d4d',
          700: '#3c5741',
          800: '#334637',
          900: '#2c3a30',
        },
        // Main background - warm neutral that ties everything together (more muted)
        'earth-bg': {
          50: '#f7f6f4',
          100: '#efede8',
          200: '#e2ded7',
          300: '#d0cac1',
          400: '#b8afa0',
          500: '#9d9286',   // Light background (more muted)
          600: '#847a6a',
          700: '#6b6056',   // Medium background
          800: '#4a443c',   // Dark background  
          900: '#342f29',   // Darkest background
        },
        // Legacy colors for compatibility
        primary: {
          50: '#f7f4f9',
          500: '#7d4a8b',
          600: '#6a3d78',
          700: '#583264',
        },
        secondary: {
          50: '#f4f7f4',
          500: '#5a8660',
          600: '#486d4d',
          700: '#3c5741',
        }
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}