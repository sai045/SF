// A central theme object for consistent styling
export const theme = {
  colors: {
    background: "#10111A", // A deep, dark blue-ish black
    primary: "#00A8FF", // Electric Blue for highlights, mana
    secondary: "#8E44AD", // Vibrant Purple for accents
    accent: "#F1C40F", // Gold for ranks, EXP, important info
    danger: "#E74C3C", // Red for warnings, errors
    text: "#ECF0F1", // Light grey/white for body text
    textMuted: "#7F8C8D", // Muted grey for sub-text
    cardBackground: "rgba(30, 31, 42, 0.8)", // Semi-transparent card bg
  },
  fonts: {
    heading: "'Bebas Neue', cursive",
    body: "'Inter', sans-serif",
  },
  // The signature "mana" glow effect
  glow: "0 0 5px #00A8FF, 0 0 10px #00A8FF, 0 0 15px #00A8FF",
  dangerGlow: "0 0 8px #E74C3C",
};
