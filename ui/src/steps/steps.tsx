"use client";

import type { DetailedHTMLProps, HTMLAttributes, ReactNode } from "react";
import { useMergedState } from "rc-util";

import { cn } from "..";
import { CheckFilled } from "../icons/check-filled";

type StepsProps = DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  current?: number;
  labelPlacement?: "vertical" | "horizontal";
  items: { title: ReactNode; description?: ReactNode }[];
};
const Steps = (props: StepsProps) => {
  const {
    className,

    current: currentProp = 0,
    labelPlacement = "horizontal",
    items,
  } = props;
  const [current] = useMergedState(0, {
    value: currentProp,
  });

  const icons = {
    finish: <CheckFilled />,
    error: <CheckFilled />,
  };
  return (
    <div className={cn("flex w-full", className)}>
      {items.map((x, index) => {
        return (
          <div
            key={index}
            className={cn(
              "relative flex",
              index < items.length - 1 && "flex-1",
            )}
          >
            <div
              className={cn(
                "flex w-20 items-center",
                labelPlacement === "vertical" && "flex-col",
                current < index && "text-foreground-muted",
              )}
            >
              {index < items.length - 1 && (
                <div
                  className={cn(
                    "absolute start-0 top-1 h-10 w-full px-6",
                    "after:ms-10 after:inline-block after:h-px after:w-full after:bg-background-muted after:transition-[background-color_0.3s]",
                    current > index && "after:bg-primary-600",
                  )}
                />
              )}
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full transition-[background-color_0.3s,border-color_0.3s]",
                  "bg-background-muted text-foreground-muted",
                  current === index && "bg-primary-600 text-white",
                  current > index && "bg-primary-200 text-primary-600",
                )}
              >
                {current > index ? icons.finish : index}
              </div>
              <div className="mt-5 flex flex-col justify-center text-center">
                {x.title}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export { Steps };
