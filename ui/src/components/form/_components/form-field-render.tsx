import type { JSX, ReactElement, ReactNode } from "react";
import type { ControllerFieldState } from "react-hook-form";
import { forwardRef, useContext } from "react";

import { cn } from "@acme/ui/lib/utils";

import { FormItemContext } from "../context";
import { FormControl } from "./form-control";
import { FieldDescription } from "./form-description";
import { FieldLabel } from "./form-label";
import { FieldMessage } from "./form-message";

type FieldRenderProps = {
  layout?: "horizontal" | "vertical";
  className?: string;
  classNames?: {
    label?: string;
  };
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
      classNames,

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
          "flex",
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
              // typeof label === "string" ? (
              //   <FieldLabel
              //     className={cn(
              //       layout === "horizontal" && "w-6/24",
              //       layout === "vertical" && "pb-2",
              //       classNames?.label,
              //     )}
              //     required={required}
              //   >
              //     {label}
              //   </FieldLabel>
              // ) : (
              //   label
              // )
              <FieldLabel
                className={cn(
                  layout === "horizontal" && "w-6/24",
                  layout === "vertical" && "pb-2",
                  classNames?.label,
                )}
                required={required}
              >
                {label}
              </FieldLabel>
            ) : undefined}
            {children}
          </>
        ) : (
          <>
            {/* Label */}
            {label ? (
              // typeof label === "string" ? (
              //   <FieldLabel
              //     className={cn(
              //       layout === "horizontal" && "w-6/24",
              //       layout === "vertical" && "pb-2",
              //       classNames?.label,
              //     )}
              //     required={required}
              //   >
              //     {label}
              //   </FieldLabel>
              // ) : (
              //   label
              // )
              <FieldLabel
                className={cn(
                  layout === "horizontal" && "w-6/24",
                  layout === "vertical" && "pb-2",
                  classNames?.label,
                )}
                required={required}
              >
                {label}
              </FieldLabel>
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
