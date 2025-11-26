import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-onboarding"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-themes"),
    getAbsolutePath("@storybook/addon-docs"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/nextjs-vite"),
    options: {},
  },
  async viteFinal(config) {
    // Resolve @acme/ui package exports and TypeScript path aliases to source files
    const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
    config.resolve = config.resolve || {};

    // Convert alias object to array format for better wildcard support
    const existingAlias = config.resolve.alias || {};
    const aliasArray = Array.isArray(existingAlias)
      ? existingAlias
      : typeof existingAlias === "object"
        ? Object.entries(existingAlias).map(([find, replacement]) => ({
            find,
            replacement,
          }))
        : [];

    // Use object format for aliases - more reliable than array with regex
    const aliasObj: Record<string, string> = {};

    // Convert existing aliases to object format
    if (Array.isArray(existingAlias)) {
      existingAlias.forEach((alias) => {
        if (typeof alias === "object" && alias.find && alias.replacement) {
          if (typeof alias.find === "string") {
            aliasObj[alias.find] = alias.replacement;
          }
        }
      });
    } else if (typeof existingAlias === "object") {
      Object.assign(aliasObj, existingAlias);
    }

    // @acme/ui package exports - only exact matches, let plugin handle wildcards
    aliasObj["@acme/ui/lib/utils"] = resolve(projectRoot, "src/lib/utils.ts");
    // Don't add @acme/ui/components here - let plugin handle both exact and wildcard cases
    // Don't add @acme/ui/icons here - let plugin handle both exact and wildcard cases

    // TypeScript path aliases - only exact matches, let plugin handle wildcards
    // Don't add @/components/ui here - let plugin handle both exact and wildcard cases
    // Don't add @/components/icons here - let plugin handle both exact and wildcard cases

    config.resolve.alias = aliasObj;

    // Add custom plugin to handle @acme/ui package resolution
    const originalPlugins = config.plugins || [];
    config.plugins = [
      ...originalPlugins,
      {
        name: "resolve-acme-ui",
        enforce: "pre",
        resolveId(id, importer) {
          // Handle @acme/ui/lib/utils and other lib exports
          if (id === "@acme/ui/lib/utils") {
            const resolved = resolve(projectRoot, "src/lib/utils.ts");
            if (existsSync(resolved)) {
              return resolved;
            }
          }
          if (id.startsWith("@acme/ui/lib/")) {
            const path = id.replace("@acme/ui/lib/", "");
            const resolved = resolve(projectRoot, `src/lib/${path}.ts`);
            if (existsSync(resolved)) {
              return resolved;
            }
          }
          // Also handle relative paths that might be incorrectly resolved
          if (importer) {
            // Handle ui/lib/utils relative paths (any number of ../)
            if (id.includes("ui/lib/utils")) {
              const match = id.match(/\.\.\/+ui\/lib\/utils$/);
              if (match || id.endsWith("ui/lib/utils")) {
                const resolved = resolve(projectRoot, "src/lib/utils.ts");
                if (existsSync(resolved)) {
                  return resolved;
                }
              }
            }
            // Handle ui/shadcn/* relative paths (any number of ../)
            if (id.includes("ui/shadcn/")) {
              const match = id.match(/\.\.\/+ui\/shadcn\/(.+)$/);
              if (match) {
                const path = match[1];
                const resolved = resolve(projectRoot, `src/shadcn/${path}.tsx`);
                if (existsSync(resolved)) {
                  return resolved;
                }
              }
            }
            // Handle ui/components/* relative paths (any number of ../)
            if (id.includes("ui/components/")) {
              const match = id.match(/\.\.\/+ui\/components\/(.+)$/);
              if (match) {
                const path = match[1];
                // Try index.ts first
                const resolved = resolve(
                  projectRoot,
                  `src/components/${path}/index.ts`,
                );
                if (existsSync(resolved)) {
                  return resolved;
                }
                // Try index.tsx
                const resolvedTsx = resolve(
                  projectRoot,
                  `src/components/${path}/index.tsx`,
                );
                if (existsSync(resolvedTsx)) {
                  return resolvedTsx;
                }
              }
            }
            // Handle ui/icons relative paths (exact match, any number of ../)
            if (id.includes("ui/icons") && !id.includes("ui/icons/")) {
              const match = id.match(/\.\.\/+ui\/icons$/);
              if (match || id.endsWith("ui/icons")) {
                const resolved = resolve(projectRoot, "src/icons/index.ts");
                if (existsSync(resolved)) {
                  return resolved;
                }
              }
            }
            // Handle ui/icons/* relative paths (any number of ../)
            if (id.includes("ui/icons/")) {
              const match = id.match(/\.\.\/+ui\/icons\/(.+)$/);
              if (match) {
                const path = match[1];
                const resolved = resolve(projectRoot, `src/icons/${path}.tsx`);
                if (existsSync(resolved)) {
                  return resolved;
                }
              }
            }
            // Handle ui/ui/* relative paths (any number of ../)
            if (id.includes("ui/ui/")) {
              const match = id.match(/\.\.\/+ui\/ui\/(.+)$/);
              if (match) {
                const path = match[1];
                const resolved = resolve(projectRoot, `src/ui/${path}.tsx`);
                if (existsSync(resolved)) {
                  return resolved;
                }
              }
            }
          }
          // Handle @acme/ui/components (exact match)
          if (id === "@acme/ui/components") {
            const resolved = resolve(projectRoot, "src/components/index.ts");
            if (existsSync(resolved)) {
              return resolved;
            }
          }
          // Handle @acme/ui/components/* (wildcard - must come after exact check)
          if (id.startsWith("@acme/ui/components/")) {
            const path = id.replace("@acme/ui/components/", "");
            // Try index.ts first
            const resolved = resolve(
              projectRoot,
              `src/components/${path}/index.ts`,
            );
            if (existsSync(resolved)) {
              return resolved;
            }
            // Try index.tsx
            const resolvedTsx = resolve(
              projectRoot,
              `src/components/${path}/index.tsx`,
            );
            if (existsSync(resolvedTsx)) {
              return resolvedTsx;
            }
            // Try direct file name (for cases where component is not in a folder)
            const resolvedDirect = resolve(
              projectRoot,
              `src/components/${path}.tsx`,
            );
            if (existsSync(resolvedDirect)) {
              return resolvedDirect;
            }
          }
          // Handle @acme/ui/icons
          if (id === "@acme/ui/icons") {
            const resolved = resolve(projectRoot, "src/icons/index.ts");
            if (existsSync(resolved)) {
              return resolved;
            }
          }
          // Handle @acme/ui/icons/*
          if (id.startsWith("@acme/ui/icons/")) {
            const path = id.replace("@acme/ui/icons/", "");
            const resolved = resolve(projectRoot, `src/icons/${path}.tsx`);
            if (existsSync(resolved)) {
              return resolved;
            }
          }
          // Handle @acme/ui/ui/*
          if (id.startsWith("@acme/ui/ui/")) {
            const path = id.replace("@acme/ui/ui/", "");
            const resolved = resolve(projectRoot, `src/ui/${path}.tsx`);
            if (existsSync(resolved)) {
              return resolved;
            }
          }
          // Handle @acme/ui/shadcn/*
          if (id.startsWith("@acme/ui/shadcn/")) {
            const path = id.replace("@acme/ui/shadcn/", "");
            const resolved = resolve(projectRoot, `src/shadcn/${path}.tsx`);
            if (existsSync(resolved)) {
              return resolved;
            }
          }
          // Handle @/components/ui (exact match)
          if (id === "@/components/ui") {
            const resolved = resolve(projectRoot, "src/components/index.ts");
            if (existsSync(resolved)) {
              return resolved;
            }
          }
          // Handle @/components/ui/* (wildcard)
          if (id.startsWith("@/components/ui/")) {
            const path = id.replace("@/components/ui/", "");
            // Try index.ts first
            const resolved = resolve(
              projectRoot,
              `src/components/${path}/index.ts`,
            );
            if (existsSync(resolved)) {
              return resolved;
            }
            // Try index.tsx
            const resolvedTsx = resolve(
              projectRoot,
              `src/components/${path}/index.tsx`,
            );
            if (existsSync(resolvedTsx)) {
              return resolvedTsx;
            }
            // Try direct file name
            const resolvedDirect = resolve(
              projectRoot,
              `src/components/${path}.tsx`,
            );
            if (existsSync(resolvedDirect)) {
              return resolvedDirect;
            }
          }
          // Handle @/components/icons (exact match)
          if (id === "@/components/icons") {
            const resolved = resolve(projectRoot, "src/icons/index.ts");
            if (existsSync(resolved)) {
              return resolved;
            }
          }
          // Handle @/components/icons/* (wildcard)
          if (id.startsWith("@/components/icons/")) {
            const path = id.replace("@/components/icons/", "");
            const resolved = resolve(projectRoot, `src/icons/${path}.tsx`);
            if (existsSync(resolved)) {
              return resolved;
            }
          }
          // Handle @/lib/* (wildcard)
          if (id.startsWith("@/lib/")) {
            const path = id.replace("@/lib/", "");
            const resolved = resolve(projectRoot, `src/lib/${path}`);
            if (existsSync(resolved)) {
              return resolved;
            }
            // Try with .ts extension
            const resolvedTs = resolve(projectRoot, `src/lib/${path}.ts`);
            if (existsSync(resolvedTs)) {
              return resolvedTs;
            }
          }
          // Handle @/hooks/* (wildcard)
          if (id.startsWith("@/hooks/")) {
            const path = id.replace("@/hooks/", "");
            const resolved = resolve(projectRoot, `src/hooks/${path}`);
            if (existsSync(resolved)) {
              return resolved;
            }
            // Try with .ts extension
            const resolvedTs = resolve(projectRoot, `src/hooks/${path}.ts`);
            if (existsSync(resolvedTs)) {
              return resolvedTs;
            }
          }
          return null;
        },
      },
    ];

    return config;
  },
};
export default config;

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
