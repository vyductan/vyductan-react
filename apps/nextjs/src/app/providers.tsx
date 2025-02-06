"use client";

import { UiConfigProvider } from "@acme/ui";
import { TailwindIndicator } from "@acme/ui/tailwind-indicator";
import { ThemeProvider, ThemeToggle } from "@acme/ui/theme";
import { Toaster } from "@acme/ui/toast";

import { TRPCReactProvider } from "~/trpc/react";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <UiConfigProvider>
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <div className="fixed bottom-4 right-4">
          <ThemeToggle />
        </div>
        <Toaster />
        <TailwindIndicator />
      </UiConfigProvider>
    </ThemeProvider>
  );
};
