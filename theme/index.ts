import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import { borderRadius, fontSize, spacing } from "tailwindcss/defaultTheme";

export default {
  darkMode: ["class"],
  content: ["src/**/*.{ts,tsx}"],
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
        link: "hsl(var(--link))",
        primary: {
          DEFAULT: "hsl(var(--primary-600))",
          hover: "hsl(var(--primary-500))",
          foreground: "hsl(var(--primary-foreground))",
          100: "hsl(var(--primary-100))",
          200: "hsl(var(--primary-200))",
          300: "hsl(var(--primary-300))",
          400: "hsl(var(--primary-400))",
          500: "hsl(var(--primary-500))",
          600: "hsl(var(--primary-600))",
          700: "hsl(var(--primary-700))",
          800: "hsl(var(--primary-800))",
          900: "hsl(var(--primary-900))",
          950: "hsl(var(--primary-950))",
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
      width: {
        "screen-md": "1024px",
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
      // Colors
      textColor: {
        placeholder: "hsl(var(--placeholder))",
      },
      borderColor: {
        "      error-hover": "hsl(var(--border-error-hover))",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
