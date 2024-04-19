import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

import { clsm } from "@acme/ui";

import "./style.css";

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
      {children && children}
    </div>
  );
};
