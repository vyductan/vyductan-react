// import { dirname, resolve } from "node:path";
// import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/nextjs-vite";
import tailwindcss from "@tailwindcss/vite";

// function getAbsolutePath(value: string): string {
//   return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
// }
import { nodeResolve } from '@rollup/plugin-node-resolve';

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],

  // addons: [
  //   getAbsolutePath("@storybook/addon-links"),
  //   getAbsolutePath("@storybook/addon-onboarding"),
  //   getAbsolutePath("@storybook/addon-a11y"),
  //   getAbsolutePath("@storybook/addon-themes"),
  //   getAbsolutePath("@storybook/addon-docs"),
  //   getAbsolutePath("@storybook/addon-vitest"),
  //   getAbsolutePath("@chromatic-com/storybook"),
  // ],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
    // NOTE: @storybook/addon-vitest completely removed to prevent mocker bundle
    // If you need story testing, run tests separately with vitest
  ],

  "framework": "@storybook/nextjs-vite",

  // framework: {
  //   name: getAbsolutePath("@storybook/nextjs-vite"),
  //   options: {},
  // },

  async viteFinal(config) {
  //   const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

  //   // Add Tailwind CSS v4 Vite plugin
    config.plugins = [tailwindcss(), nodeResolve(), ...(config.plugins ?? [])];

  //   // Configure aliases for @acme/ui package exports and TypeScript paths
  //   config.resolve = config.resolve ?? {};
  //   config.resolve.alias = {
  //     ...(config.resolve.alias ?? {}),
  //     "@/lib": resolve(projectRoot, "src/lib"),
  //     "@/hooks": resolve(projectRoot, "src/hooks"),
  //     "@/components/ui": resolve(projectRoot, "src/components"),
  //     "@/components/icons": resolve(projectRoot, "src/icons"),
  //   };

  //   // Ensure React is deduplicated
  //   config.resolve.dedupe = ["react", "react-dom"];

  //   // Disable sourcemaps to avoid warnings
    config.build = config.build ?? {};
    config.build.sourcemap = false;

  //   // Suppress "use client" directive warnings (harmless in Storybook)
    config.build.rollupOptions = config.build.rollupOptions ?? {};
  //   const originalOnWarn = config.build.rollupOptions.onwarn;
    config.build.rollupOptions.onwarn = (warning, warn) => {
      if (
        warning.message.includes('"use client"') ||
        warning.message.includes("Module level directives cause errors when bundled")||
        warning.message.includes("Can't resolve original location of error.")
      ) {
        return;
      }

        warn(warning);
    };

    // Manual chunking to improve code splitting
    // config.build.rollupOptions.output = {
    //   ...config.build.rollupOptions.output,
    //   // manualChunks: {
    //   //   "vendor-radix": ['@radix-ui/primitive']
    //   // },
    //   manualChunks: (id) => {
    //     // Vendor chunks for large dependencies
    //     if (id.includes('node_modules')) {
    //       // // React ecosystem (largest - ~500KB uncompressed)
    //       // // Now safe to split since Vitest addon is completely removed
    //       // if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
    //       //   return 'vendor-react';
    //       // }

    //       // Storybook core
    //       // if (id.includes('@storybook/')) {
    //       //   return 'vendor-storybook';
    //       // }
    //       if (id.includes('@storybook/nextjs-vite')) {
    //         return 'vendor-storybook-nextjs-vite';
    //       }
    //       // if (id.includes('@storybook/addon-vitest')) {
    //       //   return 'vendor-storybook-addon-vitest';
    //       // }
    //       // if (id.includes('@storybook/addon-docs')) {
    //       //   return 'vendor-storybook-addon-docs';
    //       // }
    //       if (id.includes('@storybook/addon-a11y')) {
    //         return 'vendor-storybook-addon-a11y';
    //       }
    //       // if (id.includes('@storybook/addon-onboarding')) {
    //       //   return 'vendor-storybook-addon-onboarding';
    //       // }
    //       // if (id.includes('@storybook/addon-themes')) {
    //       //   return 'vendor-storybook-addon-themes';
    //       // }

    //       // Radix UI components
    //       if (id.includes('@radix-ui')) {
    //         return 'vendor-radix';
    //       }

    //       // Animations
    //       if (id.includes('framer-motion')) {
    //         return 'vendor-animation';
    //       }

    //       // Form libraries
    //       if (id.includes('react-hook-form') || id.includes('@hookform')) {
    //         return 'vendor-forms';
    //       }

    //       // Date/time libraries
    //       if (id.includes('dayjs') || id.includes('date-fns')) {
    //         return 'vendor-datetime';
    //       }

    //       // Lexical editor (if used)
    //       if (id.includes('lexical') || id.includes('@lexical')) {
    //         return 'vendor-lexical';
    //       }

    //       // Icons
    //       if (id.includes('lucide-react') || id.includes('react-icons')) {
    //         return 'vendor-icons';
    //       }

    //       // Other utilities
    //       if (id.includes('lodash') || id.includes('clsx') || id.includes('class-variance-authority')) {
    //         return 'vendor-utils';
    //       }

    //       // Rest of node_modules
    //       // return 'vendor-misc';
    //     }
    //     return null
    //   },
    // };

    return config;
  },
};

export default config;
