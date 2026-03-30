import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: "@acme/ui/components",
        replacement: path.resolve(__dirname, "../../@acme/ui/src/components"),
      },
      {
        find: "@acme/ui/hooks",
        replacement: path.resolve(__dirname, "../../@acme/ui/src/hooks"),
      },
      {
        find: "@acme/ui/icons",
        replacement: path.resolve(__dirname, "../../@acme/ui/src/icons"),
      },
      {
        find: "@acme/ui/lib",
        replacement: path.resolve(__dirname, "../../@acme/ui/src/lib"),
      },
      {
        find: "@acme/ui/shadcn",
        replacement: path.resolve(__dirname, "../../@acme/ui/src/shadcn"),
      },
      {
        find: "~",
        replacement: path.resolve(__dirname, "./src"),
      },
    ],
  },
});
