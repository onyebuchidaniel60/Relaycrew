/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: 'rgb(var(--rc-canvas) / <alpha-value>)',
        'canvas-deep': 'rgb(var(--rc-canvas-deep) / <alpha-value>)',
        paper: 'rgb(var(--rc-paper) / <alpha-value>)',
        'paper-soft': 'rgb(var(--rc-paper-soft) / <alpha-value>)',
        ink: 'rgb(var(--rc-ink) / <alpha-value>)',
        'ink-soft': 'rgb(var(--rc-ink-soft) / <alpha-value>)',
        muted: 'rgb(var(--rc-muted) / <alpha-value>)',
        'muted-light': 'rgb(var(--rc-muted-light) / <alpha-value>)',
        line: 'rgb(var(--rc-line) / <alpha-value>)',
        'line-strong': 'rgb(var(--rc-line-strong) / <alpha-value>)',
        forest: {
          DEFAULT: 'rgb(var(--rc-forest) / <alpha-value>)',
          deep: 'rgb(var(--rc-forest-deep) / <alpha-value>)',
          soft: 'rgb(var(--rc-forest-soft) / <alpha-value>)',
          line: 'rgb(var(--rc-forest-line) / <alpha-value>)',
        },
        sage: 'rgb(var(--rc-sage) / <alpha-value>)',
        warm: {
          DEFAULT: 'rgb(var(--rc-warm) / <alpha-value>)',
          soft: 'rgb(var(--rc-warm-soft) / <alpha-value>)',
          ink: 'rgb(var(--rc-warm-ink) / <alpha-value>)',
          line: 'rgb(var(--rc-warm-line) / <alpha-value>)',
        },
        rust: {
          DEFAULT: 'rgb(var(--rc-rust) / <alpha-value>)',
          soft: 'rgb(var(--rc-rust-soft) / <alpha-value>)',
          line: 'rgb(var(--rc-rust-line) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Iowan Old Style', 'Palatino Linotype', 'Georgia', 'serif'],
        sans: ['Manrope', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        paper: '0 18px 40px rgba(49, 45, 34, 0.055)',
        'paper-hover': '0 24px 56px rgba(49, 45, 34, 0.1)',
      },
      borderRadius: {
        card: '10px',
        btn: '6px',
      },
      maxWidth: {
        shell: '1180px',
        app: '1120px',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
