"use client";

import { ConfigProvider } from "@/components/ui/config-provider";
import { Toaster } from "@/components/ui/toast";

import {
  TailwindIndicator,
  ThemeProvider,
  ThemeToggle,
} from "@acme/ui/components/theme";

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
