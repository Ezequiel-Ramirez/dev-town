/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      colors: {
        night: '#12121f',
        panel: '#1e2140',
        panelLight: '#2e3268',
        ink: '#0b0b14',
        accent: '#ffd447',
        accentDark: '#e0a800',
        grass: '#5aa73c',
      },
      keyframes: {
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        floatY: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        /* The main call to action pulses instead of blinking out: a button that
           disappears half the time is an arcade cliché users cannot click. */
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        blink: 'blink 1s steps(1) infinite',
        floatY: 'floatY 2s ease-in-out infinite',
        pulse: 'pulse 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
