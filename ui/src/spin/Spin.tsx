import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

import { clsm } from "@vyductan/utils";

import "./style.css";

const spinVariants = cva("", {
  variants: {
    size: {
      default: [
        "size-5",
        "before:!bg-[length:4px_4px] after:!bg-[length:6px_6px]",
        "before:m-0.5",
      ],
      lg: [
        "size-8",
        "before:!bg-[length:6px_6px] after:!bg-[length:12px_12px]",
      ],
      xl: [
        "size-12",
        "before:!bg-[length:8px_8px] after:!bg-[length:12px_12px]",
      ],
    },
  },
  defaultVariants: {
    size: "default",
  },
});
export interface SpinProps extends VariantProps<typeof spinVariants> {
  spinning?: boolean;
  children?: React.ReactNode;
}
export const Spin = ({ spinning = true, size, children }: SpinProps) => {
  return (
    <div>
      {spinning && (
        <div key="loading">
          <div
            aria-label="Loading"
            className={clsm("spin", spinVariants({ size }))}
          />
        </div>
      )}
      {children}
    </div>
  );
};
