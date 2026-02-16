// Add these to your tailwind.config.js

module.exports = {
  theme: {
    extend: {
      animation: {
        // Shimmer animations
        shimmer: "shimmer 1.5s ease-in-out",
        "shimmer-slow": "shimmer 2.5s ease-in-out infinite",
        "shimmer-fast": "shimmer 1s ease-in-out",

        // Glow animation
        glow: "glow 2s ease-in-out infinite alternate",

        // Border animation
        "border-flow": "border-flow 3s linear infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        glow: {
          "0%": { opacity: "0.3" },
          "100%": { opacity: "1" },
        },
        "border-flow": {
          "0%": { transform: "translateX(-100%) translateY(-100%)" },
          "100%": { transform: "translateX(100%) translateY(100%)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
