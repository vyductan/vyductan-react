/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
"use client";

import type { VariantProps } from "tailwind-variants";
import * as React from "react";
import omit from "rc-util/lib/omit";
import { tv } from "tailwind-variants";

import type { ProgressProps as ShadcnProgressProps } from "@acme/ui/shadcn/progress";
import { cn } from "@acme/ui/lib/utils";
import { Progress as ShadcnProgress } from "@acme/ui/shadcn/progress";

import type { ConfigConsumerProps } from "../config-provider/context";
import { devUseWarning } from "../_util/warning";
import { Icon } from "../../icons";
import { ConfigContext } from "../config-provider/context";
import { CircularProgress } from "./circle";
import { getSuccessPercent, validProgress } from "./utils";

export const ProgressTypes = ["line", "circle", "dashboard"] as const;
export type ProgressType = (typeof ProgressTypes)[number];
const ProgressStatuses = ["normal", "exception", "active", "success"] as const;
export type ProgressSize = "default" | "small";
export type StringGradients = Record<string, string>;
type FromToGradients = { from: string; to: string };
export type ProgressGradient = { direction?: string } & (
  | StringGradients
  | FromToGradients
);
export interface PercentPositionType {
  align?: "start" | "center" | "end";
  type?: "inner" | "outer";
}
export type SemanticName = "root" | "rail" | "track";

const progressVariants = tv({
  base: "",
  variants: {
    status: {
      default: "*:data-[slot=progress-indicator]:bg-blue-500",
      success: "*:data-[slot=progress-indicator]:bg-green-500",
      warning: "*:data-[slot=progress-indicator]:bg-yellow-500",
      danger: "*:data-[slot=progress-indicator]:bg-red-500",
    },
  },
  defaultVariants: {
    status: "default",
  },
});

export interface SuccessProps {
  percent?: number;
  /** @deprecated Use `percent` instead */
  progress?: number;
  strokeColor?: string;
}

export type ProgressAriaProps = Pick<
  React.AriaAttributes,
  "aria-label" | "aria-labelledby"
>;
type ProgressProps = Pick<
  ShadcnProgressProps,
  "value" | "className" | "indicatorClassName"
> &
  ProgressAriaProps &
  VariantProps<typeof progressVariants> & {
    ref?: React.RefObject<HTMLDivElement>;
    percent?: number;
    steps?: number | { count: number; gap: number };

    gapPosition?: "top" | "bottom" | "left" | "right";
    style?: React.CSSProperties;
    size?:
      | number
      | [number | string, number]
      | ProgressSize
      | { width?: number; height?: number };
    /** @deprecated Use `size` instead */
    width?: number;
    strokeLinecap?: "butt" | "square" | "round";
    strokeWidth?: number;
    gapDegree?: number;

    type?: ProgressType;
    showInfo?: boolean;
    strokeColor?: string | string[] | ProgressGradient;
    trailColor?: string;
    trailWidth?: number;
    percentPosition?: PercentPositionType;

    format?: (percent?: number, successPercent?: number) => React.ReactNode;
    status?: (typeof ProgressStatuses)[number];
    /** Configs of successfully progress bar */
    success?: SuccessProps;
    /** @deprecated Use `success` instead */
    successPercent?: number;

    children?: React.ReactNode;

    id?: string;
    loading?: boolean;
    classNames?: Partial<Record<SemanticName, string>>;
    styles?: Partial<Record<SemanticName, React.CSSProperties>>;
  };
function Progress(props: ProgressProps) {
  const {
    ref,
    className,
    percent = 0,
    steps,

    type,
    style,
    size = "default",
    showInfo = true,
    strokeColor,
    percentPosition = {},

    status,
    format,
    ...restProps
  } = props;

  const { align: infoAlign = "end", type: infoPosition = "outer" } =
    percentPosition;
  const strokeColorNotArray = Array.isArray(strokeColor)
    ? strokeColor[0]
    : strokeColor;
  // const strokeColorIsBright = React.useMemo(() => {
  //   if (strokeColorNotArray) {
  //     const color =
  //       typeof strokeColorNotArray === "string"
  //         ? strokeColorNotArray
  //         : Object.values(strokeColorNotArray)[0];
  //     return new FastColor(color).isLight();
  //   }
  //   return false;
  // }, [strokeColor]);

  const percentNumber = React.useMemo<number>(() => {
    const successPercent = getSuccessPercent(props);
    return Number.parseInt(
      successPercent === undefined
        ? percent.toString()
        : successPercent.toString(),
      10,
    );
    // eslint-disable-next-line react-hooks/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percent, props.success, props.successPercent]);

  const progressStatus = React.useMemo<
    (typeof ProgressStatuses)[number]
  >(() => {
    if (!ProgressStatuses.includes(status!) && percentNumber >= 100) {
      return "success";
    }
    return status || "normal";
  }, [status, percentNumber]);

  const { direction, progress: progressStyle } =
    React.useContext<ConfigConsumerProps>(ConfigContext);

  const isLineType = type === "line";
  const isPureLineType = isLineType && !steps;
  const progressInfo = React.useMemo<React.ReactNode>(() => {
    if (!showInfo) {
      return null;
    }
    const successPercent = getSuccessPercent(props);
    let text: React.ReactNode;
    const textFormatter = format || ((number) => `${number}%`);
    // const isBrightInnerColor =
    //   isLineType && strokeColorIsBright && infoPosition === "inner";
    if (
      infoPosition === "inner" ||
      format ||
      (progressStatus !== "exception" && progressStatus !== "success")
    ) {
      text = textFormatter(
        validProgress(percent),
        validProgress(successPercent),
      );
    } else if (progressStatus === "exception") {
      text = isLineType ? (
        <Icon icon="icon-[ant-design--close-circle-filled]" />
      ) : (
        <Icon icon="icon-[lucide--x]" />
      );
    } else if (progressStatus === "success") {
      text = isLineType ? (
        <Icon icon="icon-[ant-design--check-circle-filled]" />
      ) : (
        <Icon icon="icon-[lucide--check]" />
      );
    }

    return (
      <span
        className={cn(`progress-text`, {
          // [`progress-text-bright`]: isBrightInnerColor,
          [`progress-text-${infoAlign}`]: isPureLineType,
          [`progress-text-${infoPosition}`]: isPureLineType,
        })}
        title={typeof text === "string" ? text : undefined}
      >
        {text}
      </span>
    );
    // eslint-disable-next-line react-hooks/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showInfo, percent, percentNumber, progressStatus, type, format]);

  if (process.env.NODE_ENV !== "production") {
    const warning = devUseWarning("Progress");

    warning.deprecated(
      !("successPercent" in props),
      "successPercent",
      "success.percent",
    );
    warning.deprecated(!("width" in props), "width", "size");

    if (type === "circle" || type === "dashboard") {
      if (Array.isArray(size)) {
        warning(
          false,
          "usage",
          'Type "circle" and "dashboard" do not accept array as `size`, please use number or preset size instead.',
        );
      } else if (typeof size === "object") {
        warning(
          false,
          "usage",
          'Type "circle" and "dashboard" do not accept object as `size`, please use number or preset size instead.',
        );
      }
    }

    if (props.success && "progress" in props.success) {
      warning.deprecated(false, "success.progress", "success.percent");
    }
  }

  let progress: React.ReactNode;

  if (type === "line") {
    progress = (
      <div className={cn("relative w-full", className)}>
        <ShadcnProgress
          className={cn(progressVariants({ status }), "bg-accent")}
          value={percent}
          {...props}
        />
        {showInfo && (
          <div className="mt-1 flex justify-end">
            <span className="text-muted-foreground text-xs">{percent}%</span>
          </div>
        )}
      </div>
    );
  } else if (type === "circle" || type === "dashboard") {
    progress = (
      <CircularProgress
        {...props}
        strokeColor={strokeColorNotArray}
        progressStatus={progressStatus}
      >
        {progressInfo}
      </CircularProgress>
    );
  }

  const classString = cn();

  return (
    <div
      ref={ref}
      dir={direction}
      style={{ ...progressStyle?.style, ...style }}
      className={classString}
      role="progressbar"
      aria-valuenow={percentNumber}
      aria-valuemin={0}
      aria-valuemax={100}
      {...omit(restProps, [
        "trailColor",
        "strokeWidth",
        "width",
        "gapDegree",
        "gapPosition",
        "strokeLinecap",
        "success",
        "successPercent",
      ])}
    >
      {progress}
    </div>
  );
}

export type { ProgressProps };
export { Progress };
