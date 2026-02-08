/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Unreal Blueprints inspired dark theme
        canvas: {
          bg: '#1a1a1a',
          grid: '#2a2a2a',
        },
        sidebar: {
          bg: '#141414',
          hover: '#1f1f1f',
          border: '#2a2a2a',
        },
        panel: {
          bg: '#252525',
          border: '#333333',
        },
        node: {
          start: '#22c55e',
          dialogue: '#3b82f6',
          choice: '#a855f7',
          event: '#f97316',
          condition: '#06b6d4',
          end: '#f43f5e',
        },
        accent: {
          blue: '#4a9eff',
          hover: '#6bb3ff',
        },
        text: {
          primary: '#e5e5e5',
          secondary: '#a3a3a3',
          muted: '#666666',
        },
        validation: {
          error: '#ef4444',
          warning: '#eab308',
          success: '#22c55e',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'node': '0 4px 12px rgba(0, 0, 0, 0.4)',
        'panel': '0 8px 32px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'slide-in': 'slideIn 0.2s ease-out',
        'fade-in': 'fadeIn 0.15s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

