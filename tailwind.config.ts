import type { Config } from 'tailwindcss';

/** Identidade DRAP Business: sóbria, profissional, com destaque em azul/roxo escuro. */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        marca: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5', // primária
          700: '#4338CA',
          800: '#312E81',
          900: '#1E1B4B', // fundo escuro
        },
        tinta: '#0F172A',
      },
      fontFamily: {
        sans: ['var(--fonte-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
