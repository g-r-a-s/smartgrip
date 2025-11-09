/**
 * Color palette for the SmartGrip app
 */
export const Colors = {
  // Primary colors
  black: "#000",
  white: "#fff",

  // Gray scale
  darkGray: "#333",
  gray: "#666",
  lightGray: "#999",

  // UI elements
  background: "#000",
  text: "#fff",
  border: "#333",
  appBackground: "#f3f4f8",
  appSurface: "rgba(255, 255, 255, 0.82)",
  appSurfaceBorder: "rgba(255, 255, 255, 0.5)",
  cardSurface: "rgba(255, 255, 255, 0.92)",
  cardBorder: "rgba(255, 255, 255, 0.6)",
  textPrimaryHigh: "#1a1d1f",
  textSecondaryHigh: "rgba(26, 29, 31, 0.65)",
  textMutedHigh: "rgba(26, 29, 31, 0.45)",

  // Shared gradients
  backgroundGradientStart: "rgba(222, 218, 218, 0.1)",
  backgroundGradientMid: "rgba(240, 237, 237, 0.1)",
  backgroundGradientEnd: "rgba(169, 166, 166, 0.1)",

  // Tab bar
  tabBarBackground: "#000",
  tabBarActiveTint: "#fff",
  tabBarInactiveTint: "#666",
  tabBarBorder: "#333",
  tabBarGlassBackground: "rgba(17, 18, 26)",
  tabBarGlassBorder: "rgba(255, 255, 255, 0.12)",

  hangColor: "#FF6B35",
  farmerWalksColor: "#FF6B9D",
  dynamometerColor: "#4ECDC4",
  dynamometerLeftColor: "#FFD93D",
  dynamometerRightColor: "#6BCF7F",
  attiaChallengeColor: "#FF8A80",
  themeColor: "#FFA800",
  accentOrange: "#FF7A2E",
  accentPurple: "#A076F5",
  accentBlue: "#5DB4FF",
  accentGreen: "#74C365",
  accentGold: "#F6B544",

  fail: "#F44336",
  success: "#4CAF50",
} as const;

export default Colors;
