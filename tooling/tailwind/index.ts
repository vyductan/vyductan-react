import { THEME_TOKEN } from "../../theme/token"
import { type Config } from "tailwindcss"
import { borderRadius, fontSize, spacing } from "tailwindcss/defaultTheme"

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      textColor: {
        color: THEME_TOKEN.colorText,
        warning: THEME_TOKEN.colorWarningText,
      },
      backgroundColor: {
        warning: THEME_TOKEN.colorWarningBg,
      },
      borderColor: {
        color: THEME_TOKEN.colorBorder,
        "color-secondary": THEME_TOKEN.colorBorderSecondary,
        warning: THEME_TOKEN.colorWarningBorder,
      },
      borderRadius: {
        xs: borderRadius.DEFAULT,
        sm: borderRadius.md,
        md: borderRadius.lg,
        lg: borderRadius.xl,
        xl: borderRadius["2xl"],
        "2xl": borderRadius["3xl"],
      },
      colors: {
        error: THEME_TOKEN.colorError,
        primary: THEME_TOKEN.colorPrimary,
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
      padding: {
        lg: THEME_TOKEN.paddingLG + "px",
      },
    },
  },
  plugins: [],
} satisfies Config
