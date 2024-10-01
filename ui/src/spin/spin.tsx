import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

import { clsm } from "..";

import "./style.css";

import type { DetailedHTMLProps, HTMLAttributes } from "react";

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
  };
export const Spin = ({
  spinning = true,
  size,
  children,
  ...props
}: SpinProps) => {
  return (
    <div {...props}>
      {spinning && (
        <div
          key="loading"
          className="absolute inset-0 z-10 flex max-h-[400px] items-center justify-center"
        >
          <div
            aria-label="Loading"
            className={clsm("spin", spinVariants({ size }))}
          />
        </div>
      )}
      <div className={clsm(spinning && "pointer-events-none opacity-50")}>
        {children && children}
      </div>
    </div>
  );
};
