export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ap: {
          purple: '#7c3aed',
          cyan: '#0891b2',
          pink: '#db2777',
          green: '#059669',
          gold: '#d97706',
          dark: '#06080f'
        }
      },
      fontFamily: {
        sans: ['Open Sans', 'Liberation Sans', 'DejaVu Sans', 'Arial', 'sans-serif'],
        mono: ['DejaVu Sans Mono', 'Liberation Mono', 'monospace']
      }
    }
  },
  plugins: []
};
