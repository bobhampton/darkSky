/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep Space Backgrounds
        'space': {
          'darkest': '#000000',    // Pure black deep space
          'dark': '#0a0e27',       // Deep indigo
          'midnight': '#0d1321',   // Midnight blue
          'deep': '#0f172a',       // Slate variation
        },
        // Nebula Accents (Purple/Magenta)
        'nebula': {
          'purple': '#8b5cf6',     // Violet
          'magenta': '#d946ef',    // Fuchsia
          'light': '#c084fc',      // Light purple
        },
        // Star & Cosmic Highlights
        'star': {
          'white': '#e0f2fe',      // Star white
          'cyan': '#67e8f9',       // Cyan shimmer
          'blue': '#93c5fd',       // Soft blue
        },
        // Aurora (Success States)
        'aurora': {
          'green': '#34d399',      // Aurora green
          'teal': '#2dd4bf',       // Teal variation
        },
        // Mars Red (Warnings/Errors)
        'mars': {
          'red': '#ef4444',        // Mars red
          'orange': '#fb923c',     // Mars dust
        },
        // Golden Hour (Sunset/Sunrise)
        'golden': {
          'amber': '#fbbf24',      // Golden amber
          'yellow': '#fde047',     // Bright yellow
        },
        // Light Pollution Zones
        'pollution': {
          'low': '#1e293b',        // Dark zone
          'medium': '#334155',     // Moderate zone
          'high': '#475569',       // Light polluted
        },
      },
      backgroundImage: {
        // Galaxy Gradients
        'galaxy': 'radial-gradient(ellipse at top, #1e1b4b 0%, #0a0e27 50%, #050714 100%)',
        'deep-space': 'radial-gradient(circle at center, #0d1321 0%, #050714 100%)',
        'nebula-glow': 'radial-gradient(ellipse at top right, rgba(139, 92, 246, 0.15), transparent 60%)',
        
        // Light Pollution Gradients
        'light-dome': 'radial-gradient(ellipse at bottom, rgba(251, 191, 36, 0.1), transparent 70%)',
        'horizon-glow': 'linear-gradient(to top, rgba(251, 191, 36, 0.05) 0%, transparent 30%)',
        
        // Twilight Zones
        'twilight-dawn': 'linear-gradient(to bottom, #fbbf24 0%, #fb923c 30%, #8b5cf6 60%, #0a0e27 100%)',
        'twilight-dusk': 'linear-gradient(to top, #fbbf24 0%, #fb923c 30%, #8b5cf6 60%, #0a0e27 100%)',
      },
      boxShadow: {
        'star-glow': '0 0 20px rgba(103, 232, 249, 0.3)',
        'nebula-glow': '0 0 30px rgba(139, 92, 246, 0.4)',
        'aurora-glow': '0 0 25px rgba(52, 211, 153, 0.3)',
      },
    },
  },
  plugins: [],
}
