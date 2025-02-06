import type { JSX, ReactElement, ReactNode } from "react";
import type { ControllerFieldState } from "react-hook-form";
import { forwardRef, useContext } from "react";

import { cn } from "../..";
import { FormItemContext } from "../context";
import { FieldDescription } from "../field-description";
import { FieldLabel } from "../field-label";
import { FieldMessage } from "../field-message";
import { FormControl } from "./form-control";

type FieldRenderProps = {
  layout?: "horizontal" | "vertical";
  className?: string;

  label?: string | JSX.Element;
  description?: ReactNode;
  children?: ReactElement<any> | null;

  fieldState?: ControllerFieldState;

  required?: boolean;
};
const FieldRender = forwardRef<HTMLDivElement, FieldRenderProps>(
  (
    {
      layout = "vertical",
      className,
      label,
      description,
      children,

      fieldState,

      required,

      ...props
    },
    ref,
  ) => {
    const { id } = useContext(FormItemContext);

    return (
      <div
        className={cn(
          "flex h-full",
          layout === "horizontal" ? "flex-row items-center" : "flex-col",
          fieldState?.error ? "" : "mb-6",
          className,
        )}
        ref={ref}
        {...props}
      >
        {!id && children ? (
          <>
            {label ? (
              typeof label === "string" ? (
                <FieldLabel
                  className={cn(
                    layout === "horizontal" && "w-full",
                    layout === "vertical" && "pb-2",
                  )}
                  required={required}
                >
                  {label}
                </FieldLabel>
              ) : (
                label
              )
            ) : undefined}
            {children}
          </>
        ) : (
          <>
            {/* Label */}
            {label ? (
              typeof label === "string" ? (
                <FieldLabel
                  className={cn(
                    layout === "horizontal" && "w-full",
                    layout === "vertical" && "pb-2",
                  )}
                  required={required}
                >
                  {label}
                </FieldLabel>
              ) : (
                label
              )
            ) : undefined}
            {/* Input */}
            <FormControl>{children}</FormControl>
            {/* Description */}
            {description && <FieldDescription>{description}</FieldDescription>}
            {/* Message */}
            <FieldMessage />
          </>
        )}
      </div>
    );
  },
);

export { FieldRender };
