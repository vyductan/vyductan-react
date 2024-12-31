import type { Config } from "tailwindcss";
import { addDynamicIconSelectors } from "@iconify/tailwind";
import { fontSize } from "tailwindcss/defaultTheme";

import { baseColors } from "./colors";

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
          // DEFAULT: "hsl(var(--muted))",
          // foreground: "hsl(var(--muted-foreground))",
          DEFAULT: baseColors.gray[100],
          foreground: baseColors.gray[900],
        },
        accent: {
          // DEFAULT: "hsl(var(--accent))",
          // foreground: "hsl(var(--accent-foreground))",
          DEFAULT: baseColors.gray[100],
          foreground: baseColors.gray[900],
        },
        popover: {
          // DEFAULT: "hsl(var(--popover))",
          // foreground: "hsl(var(--popover-foreground))",
          DEFAULT: baseColors.surface.DEFAULT,
          foreground: baseColors.gray[950],
        },
        card: {
          // DEFAULT: "hsl(var(--card))",
          // foreground: "hsl(var(--card-foreground))",
          DEFAULT: baseColors.surface.DEFAULT,
          foreground: baseColors.gray[950],
        },
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
        /* Own */
        ...baseColors,
        disabled: baseColors.gray[500],
        foreground: {
          DEFAULT: baseColors.gray[950],
          muted: {
            DEFAULT: baseColors.gray[900],
          },
          reserve: baseColors.surface.DEFAULT,
        },
        background: {
          DEFAULT: baseColors.surface.DEFAULT,
          hover: baseColors.gray[200],
          active: baseColors.gray[300],
          muted: {
            DEFAULT: baseColors.gray[100],
          },
        },
        link: {
          DEFAULT: baseColors.blue[600],
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
