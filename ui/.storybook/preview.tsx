import type { Preview } from "@storybook/nextjs-vite";

import "styles/globals.css";

import { ConfigProvider } from "@acme/ui/components/config-provider";

import { Toaster } from "../src/components/toast/toaster";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    // layout: "centered",

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
  decorators: [
    (Story) => (
      <ConfigProvider>
        <Story />
        <Toaster />
      </ConfigProvider>
    ),
    // withThemeByClassName({
    //   themes: {
    //     light: "light",
    //     dark: "dark",
    //   },
    //   defaultTheme: "light",
    // }),
  ],
};

export default preview;
