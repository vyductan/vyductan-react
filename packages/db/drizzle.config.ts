import type { Config } from "drizzle-kit";

import { DB_PREFIX } from "./src/_db";

if (!process.env.POSTGRES_URL) {
  throw new Error("Missing POSTGRES_URL");
}

const nonPoolingUrl = process.env.POSTGRES_URL.replace(":6543", ":5432");

export default {
  schema: "./src/_db/**/schema.ts",
  // schema: "./src/schema.ts",
  // schema: "./src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: { url: nonPoolingUrl },
  tablesFilter: [DB_PREFIX + "*"],
  casing: "snake_case",
} satisfies Config;
