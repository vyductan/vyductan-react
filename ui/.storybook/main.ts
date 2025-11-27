import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/nextjs-vite";

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

// Manual chunks function for code splitting optimization
function createManualChunks(id: string): string | undefined {
  // React core libraries
  if (
    id.includes("node_modules/react/") ||
    id.includes("node_modules/react-dom/") ||
    id.includes("node_modules/react-is/") ||
    id.includes("node_modules/scheduler/")
  ) {
    return "vendor-react";
  }

  // UI libraries - Radix UI
  if (id.includes("node_modules/@radix-ui/")) {
    return "vendor-radix-ui";
  }

  // UI libraries - Framer Motion
  if (id.includes("node_modules/framer-motion/")) {
    return "vendor-framer-motion";
  }

  // Syntax highlighters - Shiki and related
  if (
    id.includes("node_modules/shiki/") ||
    id.includes("node_modules/@shikijs/") ||
    id.includes("node_modules/vscode-oniguruma/") ||
    id.includes("node_modules/vscode-textmate/")
  ) {
    return "vendor-syntax";
  }

  // WebAssembly and large binary dependencies
  if (
    id.includes("node_modules/@wasm-tool/") ||
    id.includes(".wasm") ||
    id.includes("wasm-tool")
  ) {
    return "vendor-wasm";
  }

  // Accessibility testing - axe-core
  if (
    id.includes("node_modules/axe-core/") ||
    id.includes("node_modules/@axe-core/")
  ) {
    return "vendor-axe";
  }

  // Date/time utilities
  if (
    id.includes("node_modules/dayjs/") ||
    id.includes("node_modules/date-fns/") ||
    id.includes("node_modules/moment/")
  ) {
    return "vendor-date";
  }

  // Storybook addons and core
  if (id.includes("node_modules/@storybook/") || id.includes("storybook/")) {
    // Split Storybook addons separately
    if (id.includes("@storybook/addon-")) {
      return "storybook-addons";
    }
    // Storybook core can stay in main bundle or be split
    return "storybook-core";
  }

  // Ant Design and RC components
  if (
    id.includes("node_modules/antd/") ||
    id.includes("node_modules/rc-") ||
    id.includes("node_modules/@rc-component/")
  ) {
    return "vendor-antd";
  }

  // Other large vendor libraries
  if (id.includes("node_modules/")) {
    // Group other node_modules into vendor chunk
    // Extract package name from path
    const match = id.match(/node_modules\/(@?[^/]+)/);
    if (match) {
      const packageName = match[1];
      // Keep very large packages separate
      if (
        packageName.startsWith("@") ||
        packageName.includes("lucide") ||
        packageName.includes("clsx") ||
        packageName.includes("class-variance-authority")
      ) {
        return "vendor-misc";
      }
    }
    return "vendor";
  }

  return undefined;
}

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-onboarding"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-themes"),
    getAbsolutePath("@storybook/addon-docs"),
    // Only include vitest addon in development mode to avoid build issues
    ...(process.env.NODE_ENV !== "production" &&
    process.env.STORYBOOK_BUILD !== "true"
      ? [getAbsolutePath("@storybook/addon-vitest")]
      : []),
    getAbsolutePath("@chromatic-com/storybook")
  ],
  framework: {
    name: getAbsolutePath("@storybook/nextjs-vite"),
    options: {},
  },
  async viteFinal(config) {
    // Store Storybook's original define configuration to maintain internal module aliases
    // This is critical for Storybook's internal modules like __STORYBOOK_MODULE_CORE_EVENTS__
    // Storybook sets up these defines automatically, and we must preserve them
    const originalDefine = config.define ? { ...config.define } : undefined;

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

    // Improve sourcemap configuration to resolve original locations
    // Enable sourcemaps for better error reporting in both dev and build
    config.build = config.build || {};
    if (config.build.sourcemap === undefined) {
      config.build.sourcemap = true;
    }

    // Ensure proper sourcemap generation in rollup
    config.build.rollupOptions = config.build.rollupOptions || {};
    if (!config.build.rollupOptions.output) {
      config.build.rollupOptions.output = {};
    }

    // Configure code splitting for output
    // Note: Vite doesn't support rollupOptions.output.sourcemap, use build.sourcemap instead
    if (Array.isArray(config.build.rollupOptions.output)) {
      config.build.rollupOptions.output = config.build.rollupOptions.output.map(
        (output) => ({
          ...output,
          manualChunks: output.manualChunks || createManualChunks,
        }),
      );
    } else if (typeof config.build.rollupOptions.output === "object") {
      config.build.rollupOptions.output = {
        ...config.build.rollupOptions.output,
        manualChunks:
          config.build.rollupOptions.output.manualChunks || createManualChunks,
      };
    }

    // Configure sourcemap for dev server (where warnings occur)
    config.server = config.server || {};
    config.server.sourcemapIgnoreList =
      config.server.sourcemapIgnoreList || false;

    // Suppress harmless warnings in Storybook build
    config.build = config.build || {};
    config.build.rollupOptions = config.build.rollupOptions || {};
    const originalOnWarn = config.build.rollupOptions.onwarn;
    config.build.rollupOptions.onwarn = (warning, warn) => {
      // Suppress "use client" directive warnings - these are harmless in Storybook
      // Component files need "use client" for Next.js but it's ignored in Storybook
      if (
        warning.message?.includes('"use client"') ||
        warning.message?.includes(
          "Module level directives cause errors when bundled",
        )
      ) {
        return;
      }
      // Suppress sourcemap resolution errors - these don't affect functionality
      if (
        warning.message?.includes(
          "Error when using sourcemap for reporting an error",
        ) ||
        warning.message?.includes("Can't resolve original location of error")
      ) {
        return;
      }
      // Call original warn handler for other warnings
      if (originalOnWarn) {
        originalOnWarn(warning, warn);
      } else {
        warn(warning);
      }
    };

    // Suppress harmless warnings by configuring log level filter
    // Note: These warnings are harmless - "use client" is needed for Next.js
    // but ignored in Storybook, and sourcemap errors don't affect functionality
    if (!config.logLevel || config.logLevel === "info") {
      // Keep info level but we'll filter specific warnings via onwarn
    }

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
          // Handle @acme/hooks/* (workspace package)
          // @acme/hooks exports: "./*": "./src/*/index.ts"
          // So @acme/hooks/use-responsive -> @acme/hooks/src/use-responsive/index.ts
          if (id.startsWith("@acme/hooks/")) {
            const hooksRoot = resolve(projectRoot, "../hooks");
            const path = id.replace("@acme/hooks/", "");
            // Resolve to src/{path}/index.ts based on export pattern
            const resolved = resolve(hooksRoot, `src/${path}/index.ts`);
            if (existsSync(resolved)) {
              return resolved;
            }
          }
          return null;
        },
      },
    ];

    // Restore Storybook's original define configuration to ensure internal modules work
    // Merge with any defines that might have been added during config modifications
    // Always ensure define exists as an object to prevent undefined errors
    config.define = {
      ...(originalDefine || {}),
      ...(config.define || {}),
    };

    return config;
  },
};

export default config;
