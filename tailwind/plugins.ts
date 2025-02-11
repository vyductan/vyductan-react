import type { Config } from "tailwindcss";
import { addDynamicIconSelectors } from "@iconify/tailwind";

export default {
  plugins: [addDynamicIconSelectors()],
} satisfies Config;
