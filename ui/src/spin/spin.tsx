import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

import { cn } from "..";

import "./style.css";

import type { DetailedHTMLProps, HTMLAttributes, ReactNode } from "react";

const spinVariants = cva("", {
  variants: {
    size: {
      small: [
        "size-5",
        "before:!bg-[length:4px_4px] after:!bg-[length:6px_6px]",
        "before:m-0.5",
      ],
      default: [
        "size-7",
        "before:!bg-[length:5px_5px] after:!bg-[length:8px_8px]",
      ],
      lg: [
        "size-12",
        "before:!bg-[length:8px_8px] after:!bg-[length:12px_12px]",
      ],
    },
  },
  defaultVariants: {
    size: "default",
  },
});
export type SpinProps = DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> &
  VariantProps<typeof spinVariants> & {
    spinning?: boolean;
    tip?: ReactNode;
  };
export const Spin = ({
  spinning = true,
  tip,
  className,
  size,
  children,
  ...props
}: SpinProps) => {
  return (
    <div className={cn("relative", className)} {...props}>
      {spinning && (
        <div
          key="loading"
          className="absolute inset-0 z-10 flex max-h-[400px] flex-col items-center justify-center"
        >
          <div
            aria-label="Loading"
            className={cn("spin", spinVariants({ size }))}
          />
          {tip && <div className="mt-2">{tip}</div>}
        </div>
      )}
      <div
        className={cn("h-full", spinning && "pointer-events-none opacity-50")}
      >
        {children}
      </div>
    </div>
  );
};
