import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx,mdx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
    "./src/store/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--colour-background))",
        foreground: "hsl(var(--colour-foreground))",
        muted: "hsl(var(--colour-muted))",
        accent: "hsl(var(--colour-accent))",
        positive: "hsl(var(--colour-positive))",
        neutral: "hsl(var(--colour-neutral))",
        negative: "hsl(var(--colour-negative))",
        conflict: "hsl(var(--colour-conflict))",
        banner: "hsl(var(--colour-banner))",
      },
      boxShadow: {
        card: "0 8px 20px -12px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
