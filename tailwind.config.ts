import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6C63FF',
          hover: '#7B73FF',
          soft: 'rgba(108, 99, 255, 0.15)',
        },
        accent: {
          DEFAULT: '#00D9FF',
          hover: '#33E1FF',
        },
        surface: {
          base: '#0A0A0F',
          DEFAULT: '#1A1A2E',
          hover: '#2A2A3E',
        },
        text: {
          primary: '#E0E0E0',
          secondary: '#888888',
          muted: '#555555',
        },
        border: {
          DEFAULT: '#1A1A2E',
          hover: '#6C63FF',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      boxShadow: {
        card: '0 4px 24px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 8px 32px rgba(108, 99, 255, 0.15)',
        glow: '0 0 20px rgba(108, 99, 255, 0.3)',
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #6C63FF, #00D9FF)',
        'gradient-card-border': 'linear-gradient(135deg, rgba(108,99,255,0.5), rgba(0,217,255,0.5))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

export default config
