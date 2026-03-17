import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0f0d0a',
        bg2: '#181410',
        surface: '#221c12',
        surface2: '#2e2518',
        border: '#3d3020',
        gold: '#f0a500',
        amber: '#ff8c00',
        cream: '#ede0c4',
        green: '#56c271',
        red: '#f05a5a',
        blue: '#5aabf0',
        muted: 'rgba(237,224,196,0.45)',
      },
      fontFamily: {
        bebas: ['var(--font-bebas)', 'cursive'],
        mono: ['var(--font-dm-mono)', 'monospace'],
        nunito: ['var(--font-nunito)', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.25s ease',
      },
    },
  },
  plugins: [],
}

export default config
