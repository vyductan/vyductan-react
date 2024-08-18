"use client";

import type { HTMLAttributes } from "react";
import { forwardRef } from "react";

import { clsm } from "..";
import { useField } from "./useField";

const FieldMessage = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, fieldMessageId } = useField();
  const body = error ? String(error.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={fieldMessageId}
      className={clsm("mb-1 text-sm text-error", className)}
      {...props}
    >
      {body}
    </p>
  );
});
FieldMessage.displayName = "FieldMessage";

export { FieldMessage };
