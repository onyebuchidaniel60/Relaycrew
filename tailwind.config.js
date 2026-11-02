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
        'paper-warm': 'rgb(var(--rc-paper-warm) / <alpha-value>)',
        ink: 'rgb(var(--rc-ink) / <alpha-value>)',
        'ink-soft': 'rgb(var(--rc-ink-soft) / <alpha-value>)',
        muted: 'rgb(var(--rc-muted) / <alpha-value>)',
        'muted-light': 'rgb(var(--rc-muted-light) / <alpha-value>)',
        line: 'rgb(var(--rc-line) / <alpha-value>)',
        'line-strong': 'rgb(var(--rc-line-strong) / <alpha-value>)',
        forest: {
          DEFAULT: 'rgb(var(--rc-forest) / <alpha-value>)',
          deep: 'rgb(var(--rc-forest-deep) / <alpha-value>)',
          mid: 'rgb(var(--rc-forest-mid) / <alpha-value>)',
          soft: 'rgb(var(--rc-forest-soft) / <alpha-value>)',
          line: 'rgb(var(--rc-forest-line) / <alpha-value>)',
        },
        sage: {
          DEFAULT: 'rgb(var(--rc-sage) / <alpha-value>)',
          soft: 'rgb(var(--rc-sage-soft) / <alpha-value>)',
          line: 'rgb(var(--rc-sage-line) / <alpha-value>)',
        },
        amber: {
          DEFAULT: 'rgb(var(--rc-amber) / <alpha-value>)',
          soft: 'rgb(var(--rc-amber-soft) / <alpha-value>)',
          ink: 'rgb(var(--rc-amber-ink) / <alpha-value>)',
          line: 'rgb(var(--rc-amber-line) / <alpha-value>)',
        },
        clay: {
          DEFAULT: 'rgb(var(--rc-clay) / <alpha-value>)',
          soft: 'rgb(var(--rc-clay-soft) / <alpha-value>)',
          line: 'rgb(var(--rc-clay-line) / <alpha-value>)',
        },
        /* Existing semantic status utilities map onto review-02 amber/clay. */
        warm: {
          DEFAULT: 'rgb(var(--rc-amber) / <alpha-value>)',
          soft: 'rgb(var(--rc-amber-soft) / <alpha-value>)',
          ink: 'rgb(var(--rc-amber-ink) / <alpha-value>)',
          line: 'rgb(var(--rc-amber-line) / <alpha-value>)',
        },
        rust: {
          DEFAULT: 'rgb(var(--rc-clay) / <alpha-value>)',
          soft: 'rgb(var(--rc-clay-soft) / <alpha-value>)',
          line: 'rgb(var(--rc-clay-line) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['Newsreader', 'Iowan Old Style', 'Palatino Linotype', 'Georgia', 'serif'],
        sans: ['Instrument Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        paper: '0 18px 44px rgba(49, 44, 32, 0.07)',
        'paper-hover': '0 24px 56px rgba(49, 44, 32, 0.12)',
        lift: '0 28px 70px rgba(43, 38, 27, 0.15)',
      },
      borderRadius: {
        card: '3px',
        btn: '2px',
      },
      maxWidth: {
        shell: '1280px',
        app: '1280px',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
