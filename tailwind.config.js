/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gh-bg': '#0d1117',
        'gh-bg-secondary': '#161b22',
        'gh-border': '#30363d',
        'gh-text': '#c9d1d9',
        'gh-text-muted': '#8b949e',
        'gh-accent': '#58a6ff',
        'gh-green': '#3fb950',
        'gh-red': '#f85149',
        'gh-yellow': '#d29922',
        'gh-purple': '#a371f7',
      },
    },
  },
  plugins: [],
}
