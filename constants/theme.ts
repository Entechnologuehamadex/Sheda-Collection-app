/**
 * Sheda's palette, in the one place a non-Tailwind style can reach it.
 *
 * NativeWind covers most of the app, but anything passed as a prop — an
 * ActivityIndicator colour, a StatusBar tint — needs the literal. Keeping
 * them here means the two cannot drift apart silently.
 */
export const COLORS = {
  primary: "#C1272D",
  primaryLight: "#C1272D0A",
  background: "#FFFFFF",
  primaryText: "#000000",
  secondaryText: "#878787",
  cardBackground: "#F5F5F5",
  borderColor: "#D8DADC",
  active: "#FFE6E6",
  positive: "#0F7A46",
  positiveLight: "#E4F2EA",
  caution: "#9D5C06",
  cautionLight: "#FAF0DF",
} as const;

/** The rental app's button radius. Matched so the two feel like one product. */
export const RADIUS = 12;
