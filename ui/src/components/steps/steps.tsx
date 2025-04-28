// Line: https://mui.com/material-ui/react-stepper/?srsltid=AfmBOoqD9hPvI4qfGHM8EO7B2ukciwhocSiX6o_Q0CQjZcZVVOkYWGUL
// TODO: description should below title and line inline with title https://ant.design/components/steps
"use client";

import type { DetailedHTMLProps, HTMLAttributes, ReactNode } from "react";
import React from "react";
import { useMergedState } from "@rc-component/util";

import { cn } from "@acme/ui/lib/utils";

import { CloseOutlined } from "../../icons";
import { CheckFilled } from "../../icons/check-filled";

type StepItemDef = {
  title: ReactNode;
  description?: ReactNode;
  icon?: React.ReactNode;
};
type StepsProps = DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  current?: number;
  labelPlacement?: "vertical" | "horizontal";
  items: StepItemDef[];
  itemRender?: (
    step: StepItemDef,
    index: number,
    current: number,
    icons: {
      finish: React.ReactNode;
      error: React.ReactNode;
    },
  ) => React.ReactNode;

  classNames?: {
    item?: string;
    line?: string;
  };
};
const Steps = (props: StepsProps) => {
  const {
    className,
    classNames,

    current: currentProp = 0,
    labelPlacement = "horizontal",
    items,
    itemRender,
  } = props;
  const [current] = useMergedState(0, {
    value: currentProp,
  });

  const icons = {
    finish: <CheckFilled />,
    error: <CloseOutlined />,
  };
  return (
    <div className={cn("flex w-full items-center", className)}>
      {items.map((x, index) => {
        return (
          <React.Fragment key={index}>
            <div
              className={cn(
                // "px-4 first:ps-0",
                "flex-1 last:flex-none",
                "outline-hidden",
                // "relative inline-block pe-4",
                "flex items-center",
                labelPlacement === "vertical" && "flex-col",
                current < index && "text-muted-foreground",
                // "after:mx-4 after:inline-block after:h-px after:w-full after:bg-background-muted after:transition-colors after:duration-300",
                classNames?.item,
              )}
            >
              {itemRender ? (
                itemRender(x, index, current, icons)
              ) : (
                <>
                  <div
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full transition-colors duration-300",
                      "bg-background-muted text-muted-foreground",
                      current === index && "bg-primary-600 text-white",
                      current > index && "bg-primary-200 text-primary-600",
                    )}
                  >
                    {current > index ? icons.finish : index}
                  </div>
                  <div className="mt-5 flex flex-col justify-center text-center">
                    {x.title}
                  </div>
                </>
              )}
            </div>
            {/* Line */}
            {index < items.length - 1 && (
              <div
                className={cn(
                  // "absolute start-0 top-1 h-10 w-full px-6",
                  // "after:ms-10 after:inline-block after:h-px after:w-full after:bg-background-muted after:transition-colors after:duration-300",
                  "bg-accents-2 mx-4 inline-block h-px w-full transition-colors duration-300",
                  current > index && "bg-primary-600",
                  classNames?.line,
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export type { StepItemDef, StepsProps };
export { Steps };
