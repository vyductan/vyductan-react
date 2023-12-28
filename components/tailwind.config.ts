import { type Config } from "tailwindcss";

import baseConfig from "@vyductan/theme-config";

export default {
  content: ["./**/*.{ts,tsx}"],
  presets: [baseConfig],
} satisfies Config;
