"use client";

import type { HTMLAttributes } from "react";
import { forwardRef } from "react";

import { cn } from "..";
import { useField } from "./use-field";

const FieldMessage = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, fieldMessageId } = useField();
  const body = error ? String(error.message) : children;

  if (!body) {
    return;
  }

  return (
    <p
      ref={ref}
      id={fieldMessageId}
      className={cn("mb-1 text-sm text-error", className)}
      {...props}
    >
      {body}
    </p>
  );
});
FieldMessage.displayName = "FieldMessage";

export { FieldMessage, FieldMessage as FormMessage };
