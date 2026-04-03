"use client";

import { ConfigProvider } from "@acme/ui/components/config-provider";
import {
  TailwindIndicator,
  ThemeProvider,
  ThemeToggle,
} from "@acme/ui/components/theme";
import { Toaster } from "@acme/ui/components/toast";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConfigProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        <div className="absolute right-4 bottom-4">
          <ThemeToggle />
        </div>
        <Toaster />
        <TailwindIndicator />
      </ThemeProvider>
    </ConfigProvider>
  );
};
