## Packages
framer-motion | Smooth animations for page transitions and UI elements
date-fns | Date formatting and manipulation
recharts | Charts for financial history visualization
lucide-react | Icons for the UI (already in base, but emphasizing usage)
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility for merging Tailwind classes safely

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  sans: ["Inter", "sans-serif"],
  display: ["'Space Grotesk'", "sans-serif"],
  mono: ["'Space Mono'", "monospace"],
}
colors:
  primary: "#10b981", // Emerald 500
  "primary-foreground": "#ffffff",
  danger: "#ef4444", // Red 500
  background: "#0f172a", // Slate 900
  card: "#1e293b", // Slate 800
  "card-foreground": "#f8fafc", // Slate 50
  muted: "#94a3b8", // Slate 400
