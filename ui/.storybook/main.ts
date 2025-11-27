import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/nextjs-vite";
import tailwindcss from "@tailwindcss/vite";

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

// Manual chunks function for code splitting optimization
function createManualChunks(id: string): string | undefined {
  // CRITICAL: Check Storybook FIRST before any other rules
  // Keep ALL Storybook code in main bundle to ensure __STORYBOOK_MODULE_* resolution works
  // This MUST be the first check to prevent Storybook from being caught by other vendor rules
  if (id.includes("/@storybook/") || id.includes("/storybook/")) {
    return undefined; // Keep in main bundle
  }

  // Don't split React into a separate chunk for Storybook builds
  // This ensures React is always available when components use React.forwardRef
  // React should stay in the main bundle to avoid loading order issues
  // React core libraries - return undefined to keep in main bundle
  // Also keep React-dependent libraries in main bundle to prevent "forwardRef is undefined" errors
  // when they load before React
  if (
    id.includes("node_modules/react/") ||
    id.includes("node_modules/react-dom/") ||
    id.includes("node_modules/react-is/") ||
    id.includes("node_modules/scheduler/") ||
    id.includes("node_modules/@rc-component/") ||
    id.includes("node_modules/rc-util/") ||
    // Keep React-dependent scoped packages with React to prevent vendor-misc errors
    id.includes("node_modules/@lexical/") ||
    id.includes("node_modules/@tanstack/") ||
    id.includes("node_modules/@hookform/") ||
    id.includes("node_modules/@dnd-kit/") ||
    id.includes("node_modules/@excalidraw/") ||
    id.includes("node_modules/react-colorful/") ||
    id.includes("node_modules/react-day-picker/") ||
    id.includes("node_modules/react-dropzone/") ||
    id.includes("node_modules/react-hook-form/") ||
    id.includes("node_modules/react-markdown/") ||
    id.includes("node_modules/react-resizable-panels/") ||
    id.includes("node_modules/react-textarea-autosize/") ||
    id.includes("node_modules/embla-carousel-react/") ||
    id.includes("node_modules/next-themes/") ||
    id.includes("node_modules/vaul/") ||
    id.includes("node_modules/cmdk/") ||
    id.includes("node_modules/sonner/") ||
    // Keep lucide-react and @floating-ui/react with React (they use React.forwardRef)
    id.includes("node_modules/lucide-react/") ||
    id.includes("node_modules/@floating-ui/react/")
  ) {
    return undefined; // Keep React and React-dependent libs in main bundle for Storybook
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

  // Ant Design and other RC components (but not @rc-component/util or rc-util - those are with React)
  if (
    id.includes("node_modules/antd/") ||
    (id.includes("node_modules/rc-") && !id.includes("node_modules/rc-util/"))
  ) {
    return "vendor-antd";
  }

  // Other large vendor libraries
  if (id.includes("node_modules/")) {
    // CRITICAL: Skip Storybook packages - they must stay in main bundle
    // This is a safety check in case the first check didn't catch it
    if (id.includes("storybook")) {
      return undefined;
    }

    // Group other node_modules into vendor chunk
    // Extract package name from path
    const match = id.match(/node_modules\/(@?[^/]+)/);
    if (match) {
      const packageName = match[1];
      // Don't put React-dependent packages in vendor-misc - they should be with React
      // Only put non-React scoped packages and utility libraries in vendor-misc
      // Exclude lucide-react and @floating-ui/react (they're React-dependent and handled above)
      if (
        (packageName.startsWith("@") &&
          !packageName.includes("floating-ui")) ||
        (packageName.includes("lucide") && packageName !== "lucide-react") ||
        packageName.includes("clsx") ||
        packageName.includes("class-variance-authority")
      ) {
        // Double-check: don't put React-dependent packages here (they're already handled above)
        // This is a fallback for non-React scoped packages
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
    // Store both the original and track any Storybook defines that might be added later
    const originalDefine = config.define ? { ...config.define } : undefined;
    
    // Extract Storybook internal module defines (those starting with __STORYBOOK_MODULE_)
    // These must be preserved throughout the viteFinal hook
    const storybookDefines: Record<string, any> = {};
    if (config.define) {
      for (const [key, value] of Object.entries(config.define)) {
        if (key.startsWith("__STORYBOOK_MODULE_")) {
          storybookDefines[key] = value;
        }
      }
    }

    // Ensure React is pre-bundled and available
    // This fixes the "Cannot read properties of undefined (reading 'forwardRef')" error
    // by ensuring React is properly resolved before components use it
    config.optimizeDeps = config.optimizeDeps || {};
    config.optimizeDeps.include = [
      ...(config.optimizeDeps.include || []),
      "react",
      "react-dom",
      "react/jsx-runtime",
      // Pre-bundle React-dependent libraries to ensure React is available when they load
      "@rc-component/util",
      "rc-util",
      // Pre-bundle React-dependent scoped packages to prevent vendor-misc errors
      // Note: @lexical/react removed due to package.json exports issue
      "@tanstack/react-table",
      "react-hook-form",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
      "react-colorful",
      "react-day-picker",
      "react-dropzone",
      "react-markdown",
      "react-resizable-panels",
      "react-textarea-autosize",
      "embla-carousel-react",
      "next-themes",
      "vaul",
      "cmdk",
      "sonner",
      // Pre-bundle lucide-react and @floating-ui/react to prevent vendor-misc errors
      "lucide-react",
      "@floating-ui/react",
    ];

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

    // Ensure React is deduplicated - critical for preventing "forwardRef is undefined" errors
    // This ensures only one React instance is used across all modules
    config.resolve.dedupe = [
      ...(config.resolve.dedupe || []),
      "react",
      "react-dom",
    ];

    // Explicitly ensure React resolution - prevent any module resolution issues
    // This ensures React is always resolved from the same location
    if (!config.resolve.conditions) {
      config.resolve.conditions = [];
    }
    // Ensure React is resolved with proper conditions
    config.resolve.conditions = [
      ...new Set([...config.resolve.conditions, "import", "module", "browser", "default"]),
    ];

    // Improve sourcemap configuration to resolve original locations
    // Enable sourcemaps for better error reporting in both dev and build
    config.build = config.build || {};
    if (config.build.sourcemap === undefined) {
      config.build.sourcemap = true;
    }

    // Ensure proper sourcemap generation in rollup
    config.build.rollupOptions = config.build.rollupOptions || {};
    
    // Ensure React is not externalized (should be bundled)
    // This is critical for Storybook builds to work correctly
    if (!config.build.rollupOptions.external) {
      config.build.rollupOptions.external = [];
    }
    // Ensure React and React-DOM are not in the external list
    const external = config.build.rollupOptions.external;
    if (Array.isArray(external)) {
      config.build.rollupOptions.external = external.filter(
        (id) => {
          if (typeof id === "string") {
            return id !== "react" && id !== "react-dom" && !id.startsWith("react/");
          }
          // Keep RegExp patterns as they might match other modules
          return true;
        },
      );
    } else if (typeof external === "function") {
      const originalExternal = external as (
        id: string,
        importer?: string,
        isResolved?: boolean,
      ) => boolean | void;
      config.build.rollupOptions.external = (
        id: string,
        importer?: string,
        isResolved?: boolean,
      ) => {
        // Don't externalize React
        if (
          typeof id === "string" &&
          (id === "react" || id === "react-dom" || id.startsWith("react/"))
        ) {
          return false;
        }
        // Call original external function with proper arguments
        return originalExternal(id, importer, isResolved);
      };
    }

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
      // Add Tailwind CSS v4 Vite plugin
      tailwindcss(),
      ...originalPlugins,
      {
        name: "ensure-react-available",
        enforce: "pre",
        buildStart() {
          // This plugin ensures React is always available
          // It doesn't modify code but helps with module resolution
        },
        resolveId(id) {
          // Ensure React resolves correctly
          if (id === "react" || id === "react-dom") {
            return null; // Let Vite handle it normally, but ensure it's not externalized
          }
          return null;
        },
      },
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
    // CRITICAL: Preserve Storybook internal module defines - they must not be overwritten
    const currentDefine = config.define || {};
    
    // Collect all Storybook defines from both original and current config
    const allStorybookDefines: Record<string, any> = { ...storybookDefines };
    for (const [key, value] of Object.entries(currentDefine)) {
      if (key.startsWith("__STORYBOOK_MODULE_")) {
        allStorybookDefines[key] = value;
      }
    }
    
    // Merge: Storybook defines take precedence, then original, then current
    config.define = {
      ...(originalDefine || {}),
      ...currentDefine,
      ...allStorybookDefines, // Storybook defines must be preserved and take precedence
    };

    return config;
  },
};

export default config;
