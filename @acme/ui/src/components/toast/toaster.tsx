"use client";

import { cn } from "@acme/ui/lib/utils";
import { Toaster as Sonner } from "@acme/ui/shadcn/sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ className, ...props }: ToasterProps) => {
  return (
    <Sonner
      className={cn(
        // to fix drawer body pointer-events-none issue
        "pointer-events-auto",
        className,
      )}
      // style={
      //   {
      //     "--normal-bg": "var(--popover)",
      //     "--normal-text": "var(--popover-foreground)",
      //     "--normal-border": "var(--border)",
      //   } as React.CSSProperties
      // }
      toastOptions={{
        classNames: {
          closeButton: "-right-3.5 left-[unset]",
          success: "!bg-green-100 !text-green-500 !border-green-300",
          error: "!bg-red-100 !text-red-500 !border-red-300",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
