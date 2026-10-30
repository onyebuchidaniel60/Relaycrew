/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F5F0E6',
        'canvas-deep': '#EEE7DA',
        paper: '#FFFDF8',
        'paper-soft': '#FAF6ED',
        ink: '#1B1D18',
        'ink-soft': '#3F463E',
        muted: '#656C62',
        'muted-light': '#697065',
        line: '#DED5C5',
        'line-strong': '#C8BCA8',
        forest: {
          DEFAULT: '#173D2C',
          deep: '#102C20',
          soft: '#E6EDE4',
          line: '#B8C9B8',
        },
        sage: '#778977',
        warm: {
          DEFAULT: '#9A642F',
          soft: '#F3E6D1',
          ink: '#6D4A2D',
          line: '#D4B890',
        },
        rust: {
          DEFAULT: '#91422F',
          soft: '#F2DFD7',
          line: '#D3B3A7',
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
