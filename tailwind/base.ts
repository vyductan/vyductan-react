import type { Config } from "tailwindcss";
import type {
  RecursiveKeyValuePair,
  ResolvableTo,
} from "tailwindcss/types/config";
import { addDynamicIconSelectors } from "@iconify/tailwind";
import { fontSize } from "tailwindcss/defaultTheme";

const baseColors = {
  surface: {
    DEFAULT: "oklch(var(--ds-background-100) / <alpha-value>)",
    secondary: "oklch(var(--ds-background-200) / <alpha-value>)",
  },
  primary: {
    DEFAULT: "hsl(var(--primary-600))",
    hover: "hsl(var(--primary-700))",
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
  gray: {
    100: "oklch(var(--ds-gray-100) / <alpha-value>)",
    200: "oklch(var(--ds-gray-200) / <alpha-value>)",
    300: "oklch(var(--ds-gray-300) / <alpha-value>)",
    400: "oklch(var(--ds-gray-400) / <alpha-value>)",
    500: "oklch(var(--ds-gray-500) / <alpha-value>)",
    600: "oklch(var(--ds-gray-600) / <alpha-value>)",
    700: "oklch(var(--ds-gray-700) / <alpha-value>)",
    800: "oklch(var(--ds-gray-800) / <alpha-value>)",
    900: "oklch(var(--ds-gray-900) / <alpha-value>)",
    950: "oklch(var(--ds-gray-950) / <alpha-value>)",
  },
  amber: {
    100: "oklch(var(--ds-amber-100) / <alpha-value>)",
    200: "oklch(var(--ds-amber-200) / <alpha-value>)",
    300: "oklch(var(--ds-amber-300) / <alpha-value>)",
    400: "oklch(var(--ds-amber-400) / <alpha-value>)",
    500: "oklch(var(--ds-amber-500) / <alpha-value>)",
    600: "oklch(var(--ds-amber-600) / <alpha-value>)",
    700: "oklch(var(--ds-amber-700) / <alpha-value>)",
    800: "oklch(var(--ds-amber-800) / <alpha-value>)",
    900: "oklch(var(--ds-amber-900) / <alpha-value>)",
    950: "oklch(var(--ds-amber-950) / <alpha-value>)",
  },
  blue: {
    100: "oklch(var(--ds-blue-100) / <alpha-value>)",
    200: "oklch(var(--ds-blue-200) / <alpha-value>)",
    300: "oklch(var(--ds-blue-300) / <alpha-value>)",
    400: "oklch(var(--ds-blue-400) / <alpha-value>)",
    500: "oklch(var(--ds-blue-500) / <alpha-value>)",
    600: "oklch(var(--ds-blue-600) / <alpha-value>)",
    700: "oklch(var(--ds-blue-700) / <alpha-value>)",
    800: "oklch(var(--ds-blue-800) / <alpha-value>)",
    900: "oklch(var(--ds-blue-900) / <alpha-value>)",
    950: "oklch(var(--ds-blue-950) / <alpha-value>)",
  },
  green: {
    100: "oklch(var(--ds-green-100) / <alpha-value>)",
    200: "oklch(var(--ds-green-200) / <alpha-value>)",
    300: "oklch(var(--ds-green-300) / <alpha-value>)",
    400: "oklch(var(--ds-green-400) / <alpha-value>)",
    500: "oklch(var(--ds-green-500) / <alpha-value>)",
    600: "oklch(var(--ds-green-600) / <alpha-value>)",
    700: "oklch(var(--ds-green-700) / <alpha-value>)",
    800: "oklch(var(--ds-green-800) / <alpha-value>)",
    900: "oklch(var(--ds-green-900) / <alpha-value>)",
    950: "oklch(var(--ds-green-950) / <alpha-value>)",
  },
  red: {
    100: "oklch(var(--ds-red-100) / <alpha-value>)",
    200: "oklch(var(--ds-red-200) / <alpha-value>)",
    300: "oklch(var(--ds-red-300) / <alpha-value>)",
    400: "oklch(var(--ds-red-400) / <alpha-value>)",
    500: "oklch(var(--ds-red-500) / <alpha-value>)",
    600: "oklch(var(--ds-red-600) / <alpha-value>)",
    700: "oklch(var(--ds-red-700) / <alpha-value>)",
    800: "oklch(var(--ds-red-800) / <alpha-value>)",
    900: "oklch(var(--ds-red-900) / <alpha-value>)",
    950: "oklch(var(--ds-red-950) / <alpha-value>)",
  },
  pink: {
    100: "oklch(var(--ds-pink-100) / <alpha-value>)",
    200: "oklch(var(--ds-pink-200) / <alpha-value>)",
    300: "oklch(var(--ds-pink-300) / <alpha-value>)",
    400: "oklch(var(--ds-pink-400) / <alpha-value>)",
    500: "oklch(var(--ds-pink-500) / <alpha-value>)",
    600: "oklch(var(--ds-pink-600) / <alpha-value>)",
    700: "oklch(var(--ds-pink-700) / <alpha-value>)",
    800: "oklch(var(--ds-pink-800) / <alpha-value>)",
    900: "oklch(var(--ds-pink-900) / <alpha-value>)",
    950: "oklch(var(--ds-pink-950) / <alpha-value>)",
  },
  purple: {
    100: "oklch(var(--ds-purple-100) / <alpha-value>)",
    200: "oklch(var(--ds-purple-200) / <alpha-value>)",
    300: "oklch(var(--ds-purple-300) / <alpha-value>)",
    400: "oklch(var(--ds-purple-400) / <alpha-value>)",
    500: "oklch(var(--ds-purple-500) / <alpha-value>)",
    600: "oklch(var(--ds-purple-600) / <alpha-value>)",
    700: "oklch(var(--ds-purple-700) / <alpha-value>)",
    800: "oklch(var(--ds-purple-800) / <alpha-value>)",
    900: "oklch(var(--ds-purple-900) / <alpha-value>)",
    950: "oklch(var(--ds-purple-950) / <alpha-value>)",
  },
  teal: {
    100: "oklch(var(--ds-teal-100) / <alpha-value>)",
    200: "oklch(var(--ds-teal-200) / <alpha-value>)",
    300: "oklch(var(--ds-teal-300) / <alpha-value>)",
    400: "oklch(var(--ds-teal-400) / <alpha-value>)",
    500: "oklch(var(--ds-teal-500) / <alpha-value>)",
    600: "oklch(var(--ds-teal-600) / <alpha-value>)",
    700: "oklch(var(--ds-teal-700) / <alpha-value>)",
    800: "oklch(var(--ds-teal-800) / <alpha-value>)",
    900: "oklch(var(--ds-teal-900) / <alpha-value>)",
    950: "oklch(var(--ds-teal-950) / <alpha-value>)",
  },
} satisfies ResolvableTo<RecursiveKeyValuePair>;

export default {
  darkMode: ["class"],
  content: ["src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /*shadcn*/
        // border: 'hsl(var(--border))',
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        // background: 'hsl(var(--background))',
        // foreground: 'hsl(var(--foreground))',
        // primary: {
        //   DEFAULT: "hsl(var(--primary))",
        //   foreground: "hsl(var(--primary-foreground))",
        // },
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
        /* Own */
        ...baseColors,
        foreground: {
          DEFAULT: "hsl(var(--foreground))",
          muted: {
            DEFAULT: baseColors.gray[900],
          },
        },
        background: {
          DEFAULT: "hsl(var(--background))",
          // DEFAULT: baseColors.gray[100],
          hover: baseColors.gray[200],
          active: baseColors.gray[300],
          muted: {
            DEFAULT: baseColors.gray[100],
          },
        },
        link: {
          DEFAULT: baseColors.blue[600],
          // foreground: "hsl(var(--accent-foreground))",
          hover: baseColors.blue[700],
          muted: {
            DEFAULT: baseColors.blue[100],
          },
        },
        error: {
          DEFAULT: baseColors.red[800],
          hover: baseColors.red[900],
          muted: {
            DEFAULT: baseColors.red[100],
            hover: baseColors.red[200],
          },
        },
        success: {
          DEFAULT: baseColors.green[600],
          hover: baseColors.green[700],
          muted: {
            DEFAULT: baseColors.green[100],
          },
        },

        border: {
          DEFAULT: baseColors.gray[400],
          hover: baseColors.gray[500],
          active: baseColors.gray[600],
        },
        placeholder: baseColors.gray[700],

        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      /* End Colors */

      fontSize: {
        md: fontSize.base,
      },
      screens: {
        xs: "480px",
      },
      width: (pluginUtils) => ({
        ...pluginUtils.breakpoints(pluginUtils.theme("screens")),
      }),
      /**
       * Colors
       */
      textColor: {
        description: "hsl(var(--text-description))",
      },
      backgroundColor: {
        warning: "hsl(var(--warning-bg))",
      },
      borderColor: {
        warning: "hsl(var(--warning-border))",
      },
    },
  },
  plugins: [addDynamicIconSelectors()],
} satisfies Config;
