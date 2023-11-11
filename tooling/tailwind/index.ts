import type { Config } from "tailwindcss";
import { borderRadius, fontSize, spacing } from "tailwindcss/defaultTheme";

// import { THEME_TOKEN } from "../../theme/token";

export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [""],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: ({ colors }) => ({
        error: colors.red[300],
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        primary: {
          DEFAULT: "hsl(var(--primary-600))",
          hover: "hsl(var(--primary-500))",
          foreground: "hsl(var(--primary-foreground))",
          300: "hsl(var(--primary-300))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      }),
      // textColor: ({ theme }) => ({
      //   // color: THEME_TOKEN.colorText,
      //   // foreground: theme("colors.gray.800"),
      //   // warning: THEME_TOKEN.colorWarningText,
      // }),
      backgroundColor: {
        // warning: THEME_TOKEN.colorWarningBg,
      },
      borderColor: {
        // color: THEME_TOKEN.colorBorder,
        // "color-secondary": THEME_TOKEN.colorBorderSecondary,
        // warning: THEME_TOKEN.colorWarningBorder,
      },
      borderRadius: {
        xs: borderRadius.DEFAULT,
        sm: borderRadius.md,
        md: borderRadius.lg,
        lg: borderRadius.xl,
        xl: borderRadius["2xl"],
        "2xl": borderRadius["3xl"],
      },
      fontSize: {
        md: fontSize.base,
        base: fontSize.sm,
      },
      height: {
        xs: spacing[6],
        sm: spacing[8],
        md: spacing[10],
        lg: spacing[12],
        xl: spacing[14],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      padding: {
        // lg: THEME_TOKEN.paddingLG + "px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
