export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#163b2f',
        secondary: '#b14a20',
        accent: '#f3e8d5',
        surface: '#fffaf5',
        ink: '#07100b',
        parchment: '#f8f3ea',
        success: '#16a34a',
        error: '#ef4444',
        warning: '#f59e0b',
      },
      boxShadow: {
        brutal: '4px 4px 0 0 #c45c26',
        'brutal-sm': '3px 3px 0 0 #1a3a2f',
        'brutal-lg': '6px 6px 0 0 #c45c26',
        'brutal-dark': '4px 4px 0 0 #e8dcc8',
      },
      animation: {
        fadeIn: 'fadeIn 0.6s ease-out',
        slideUp: 'slideUp 0.6s ease-out',
        slideLeft: 'slideLeft 0.7s ease-out',
        float: 'float 5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(-24px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};
