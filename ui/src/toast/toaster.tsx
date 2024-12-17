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
      className="group toaster"
      toastOptions={{
        classNames: {
          toast: cn(
            "border-border shadow-lg",
            richColors ? "" : "",
            // : "toast group group-[.toaster]:border-border group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:shadow-lg",
          ),
          // description: "group-[.toast]:text-muted-foreground",
          description: "text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton: "-right-3.5 left-[unset]",
          success: "bg-success-muted text-green-700 border-green-400",
          error: "bg-error-muted text-red-700 border-red-400",
        },
      }}
      // richColors={richColors}
      {...props}
    />
  );
};

export { Toaster };
