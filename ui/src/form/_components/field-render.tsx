import type { ReactElement, ReactNode } from "react";
import type { ControllerFieldState } from "react-hook-form";
import { forwardRef } from "react";

import { cn } from "../..";
import { FieldDescription } from "../field-description";
import { FieldLabel } from "../field-label";
import { FieldMessage } from "../field-message";
import { FormControl } from "./form-control";

type FieldRenderProps = {
  className?: string;

  label?: string | JSX.Element;
  description?: ReactNode;
  children?: ReactElement | null;

  fieldId?: string;
  fieldDescriptionId?: string;
  fieldMessageId?: string;

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

      fieldId,
      // fieldDescriptionId,
      // fieldMessageId,

      fieldState,

      required,

      ...props
    },
    ref,
  ) => {
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
        {!fieldId && children ? (
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
            <FormControl>
              {children}
              {/* {children */}
              {/*   ? typeof children === "function" */}
              {/*     ? children() */}
              {/*     : cloneElement(children) */}
              {/*   : null} */}
              {/* {children */}
              {/*   ? typeof children === "function" */}
              {/*     ? children({ */}
              {/*         field, */}
              {/*         fieldState, */}
              {/*         formState, */}
              {/*       }) */}
              {/*     : cloneElement(children, field) */}
              {/*   : null} */}
            </FormControl>
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
