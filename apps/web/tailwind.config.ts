import type { Config } from 'tailwindcss';
export default { content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'], theme: { extend: { colors: { raiz: { 950: '#193526', 700: '#355b3e', 100: '#edf3df', cream: '#fbf5ed', coral: '#e46b4d' } } } }, plugins: [] } satisfies Config;
