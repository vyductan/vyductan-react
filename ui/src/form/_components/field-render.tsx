import type { ReactElement, ReactNode, JSX } from "react";
import type { ControllerFieldState } from "react-hook-form";
import { forwardRef, useContext } from "react";

import { cn } from "../..";
import { FormItemContext } from "../context";
import { FieldDescription } from "../field-description";
import { FieldLabel } from "../field-label";
import { FieldMessage } from "../field-message";
import { FormControl } from "./form-control";

type FieldRenderProps = {
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
          "flex h-full flex-col",
          fieldState?.error ? "" : "mb-6",
          className,
        )}
        ref={ref}
        {...props}
      >
        {!id && children ? (
          children
        ) : (
          <>
            {/* Label */}
            {label ? (
              typeof label === "string" ? (
                <FieldLabel className="pb-2" required={required}>
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
