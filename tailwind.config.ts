import type { Config } from 'tailwindcss';

/** Identidade DRAP Business: cores personalizadas - Paleta azul */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        marca: {
          50: '#F0F9FF',   // Azul muito claro
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',  // Primária - Azul vibrante
          700: '#0369A1',
          800: '#075985',
          900: '#0C2340',  // Azul escuro
        },
        tinta: '#0C2340',  // Texto principal - azul escuro
      },
      fontFamily: {
        sans: ['var(--fonte-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;