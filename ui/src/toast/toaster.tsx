"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

import { cn } from "..";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ richColors = true, ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: cn(
            "toast group group-[.toaster]:border-border group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:shadow-lg",
            // "border-border shadow-lg",
            richColors ? "" : "",
            "data-[type=success]:bg-green-100",
          ),
          // description: "group-[.toast]:text-muted-foreground",
          description: "text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium",
          closeButton: "-right-3.5 left-[unset]",
          success: "!bg-green-100 !text-green-700 !border-green-300",
          error: "!bg-red-100 !text-red-700 !border-red-300",
        },
      }}
      // richColors={richColors}
      {...props}
    />
  );
};

export { Toaster };
