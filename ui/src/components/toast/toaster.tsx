"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ className, ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className={cn(
        "toaster group",
        // to fix drawer body pointer-events-none issue
        "pointer-events-auto",
        className,
      )}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          closeButton: "-right-3.5 left-[unset]",
          success: "!bg-green-100 !text-green-700 !border-green-300",
          error: "!bg-red-100 !text-red-700 !border-red-300",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
