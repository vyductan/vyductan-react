"use client";

import { cn } from "@acme/ui/lib/utils";
import { Toaster as Sonner } from "@acme/ui/shadcn/sonner";

const SELECTABLE_TEXT_SELECTOR = "[data-title],[data-description]";
const INTERACTIVE_SELECTOR = [
  "button",
  "a",
  "input",
  "textarea",
  "select",
  '[role="button"]',
  '[role="link"]',
  "[contenteditable='true']",
  "[data-button]",
  "[data-action]",
  "[data-cancel]",
  "[data-close-button]",
].join(",");

function shouldBypassSwipeDismiss(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (!target.closest("[data-sonner-toast]")) {
    return false;
  }

  if (target.closest(INTERACTIVE_SELECTOR)) {
    return false;
  }

  return Boolean(target.closest(SELECTABLE_TEXT_SELECTOR));
}

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ className, toastOptions, ...props }: ToasterProps) => {
  const mergedToastOptions = {
    ...toastOptions,
    classNames: {
      ...toastOptions?.classNames,
      title: cn("select-text", toastOptions?.classNames?.title),
      description: cn("select-text", toastOptions?.classNames?.description),
      closeButton: cn(
        "-right-3.5 left-[unset]",
        toastOptions?.classNames?.closeButton,
      ),
      success: cn(
        "!bg-green-100 !text-green-500 !border-green-300",
        toastOptions?.classNames?.success,
      ),
      error: cn(
        "!bg-red-100 !text-red-500 !border-red-300",
        toastOptions?.classNames?.error,
      ),
    },
  };

  return (
    <div
      onPointerDownCapture={(event) => {
        if (shouldBypassSwipeDismiss(event.target)) {
          event.stopPropagation();
        }
      }}
    >
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
        toastOptions={mergedToastOptions}
        {...props}
      />
    </div>
  );
};

export { Toaster };
