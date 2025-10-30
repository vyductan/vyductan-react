/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
"use client";

import type { VariantProps } from "tailwind-variants";
import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { tv } from "tailwind-variants";

import { cn } from "@acme/ui/lib/utils";

import type { ConfigConsumerProps } from "../config-provider/context";
import type { CircleProps } from "./circle";
import { devUseWarning } from "../_util/warning";
import { Icon } from "../../icons";
import { ConfigContext } from "../config-provider/context";
import { CircularProgress } from "./circle";
import { getSuccessPercent, validProgress } from "./utils";

import "./style.css";

export const ProgressTypes = ["line", "circle", "dashboard"] as const;
export type ProgressType = (typeof ProgressTypes)[number];
// const ProgressStatuses = ["normal", "exception", "active", "success"] as const;
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

// Status colors - shared between line and circle progress
export const STATUS_COLORS = {
  default: {
    color: "var(--color-blue-500)",
    class: "bg-blue-500",
  },
  active: {
    color: "var(--color-blue-500)",
    class: "bg-blue-500",
  },
  success: {
    color: "var(--color-green-500)",
    class: "bg-green-500",
  },
  exception: {
    color: "var(--color-red-500)",
    class: "bg-red-500",
  },
} as const;

const progressIndicatorVariants = tv({
  variants: {
    status: {
      default: STATUS_COLORS.default.class,
      active: `progress-active relative overflow-hidden ${STATUS_COLORS.active.class}`,
      success: STATUS_COLORS.success.class,
      exception: STATUS_COLORS.exception.class,
    },
  },
});

export type ProgressStatus = VariantProps<
  typeof progressIndicatorVariants
>["status"];

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
export type CommonProgressProps = ProgressAriaProps & {
  ref?: React.RefObject<HTMLDivElement>;

  value?: number;

  type?: ProgressType;
  status?: ProgressStatus;
  className?: string;
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
  strokeColor?: string | string[] | ProgressGradient;
  strokeLinecap?: "butt" | "square" | "round";
  strokeWidth?: number;
  gapDegree?: number;

  showInfo?: boolean;
  trailColor?: string;
  trailWidth?: number;
  percentPosition?: PercentPositionType;

  format?: (percent?: number, successPercent?: number) => React.ReactNode;
  // status?: (typeof ProgressStatuses)[number];
  /** Configs of successfully progress bar */
  success?: SuccessProps;
  /** @deprecated Use `success` instead */
  successPercent?: number;

  children?: React.ReactNode;

  id?: string;
  loading?: boolean;
  classNames?: {
    text?: string;
  };
  // styles?: Partial<Record<SemanticName, React.CSSProperties>>;
};
type LineProps = CommonProgressProps & {
  type?: "line";
  status?: ProgressStatus | "active";
};

type ProgressProps = LineProps | CircleProps;

function Progress(props: ProgressProps) {
  const {
    ref,
    style,
    className,
    classNames,
    percent = 0,
    steps,

    type = "line",
    size = "default",
    showInfo = true,
    strokeColor,
    trailColor,
    strokeLinecap,
    strokeWidth,
    trailWidth,
    gapDegree,
    gapPosition,
    success,
    successPercent,
    loading: _loading,
    id: _id,
    value: _value,
    width: _width,
    percentPosition = {},

    status,
    format,
    // Remove props that should not be passed to DOM elements
    ..._restProps
  } = props;

  const { align: infoAlign = "end", type: infoPosition = "outer" } =
    percentPosition;
  const strokeColorNotArray = Array.isArray(strokeColor)
    ? strokeColor[0]
    : strokeColor;

  // Parse size to get width and height
  const sizeStyle = React.useMemo(() => {
    if (type === "line") {
      let height: number | string = 8; // default height
      let width: number | string | undefined;

      if (size === "small") {
        height = 6;
      } else if (size === "default") {
        height = 8;
      } else if (typeof size === "number") {
        height = size;
      } else if (Array.isArray(size)) {
        width = typeof size[0] === "number" ? `${size[0]}px` : size[0];
        height = size[1] || 8;
      } else if (typeof size === "object") {
        width = size.width;
        height = size.height || 8;
      }

      return {
        width: width,
        height: typeof height === "number" ? `${height}px` : height,
      };
    }
    return {};
  }, [size, type]);

  // Get stroke color style for progress indicator
  const getStrokeColorStyle = React.useMemo(() => {
    if (!strokeColor) return null;

    if (typeof strokeColor === "string") {
      return { backgroundColor: strokeColor };
    }

    if (Array.isArray(strokeColor)) {
      // Gradient from array
      const gradientColors = strokeColor.join(", ");
      return {
        backgroundImage: `linear-gradient(to right, ${gradientColors})`,
      };
    }

    if (typeof strokeColor === "object") {
      // Gradient from object
      const gradient = strokeColor;
      const { direction = "to right" } = gradient;

      if ("from" in gradient && "to" in gradient) {
        const { from, to } = gradient as FromToGradients & {
          direction?: string;
        };
        return {
          backgroundImage: `linear-gradient(${direction}, ${from}, ${to})`,
        };
      }

      const colors = gradient as StringGradients & { direction?: string };
      const colorValues = Object.entries(colors)
        .filter(([key]) => key !== "direction")
        .map(([, value]) => value)
        .join(", ");
      return {
        backgroundImage: `linear-gradient(${direction}, ${colorValues})`,
      };
    }

    return null;
  }, [strokeColor]);

  const percentNumber = React.useMemo<number>(() => {
    const computedSuccessPercent = getSuccessPercent({
      success,
      successPercent,
    });
    return Number.parseInt(
      computedSuccessPercent === undefined
        ? percent.toString()
        : computedSuccessPercent.toString(),
      10,
    );
  }, [percent, success, successPercent]);

  const progressStatus = React.useMemo<ProgressStatus>(() => {
    if (percentNumber >= 100) {
      return "success";
    }
    return status || "default";
  }, [status, percentNumber]);

  const { direction, progress: progressStyle } =
    React.useContext<ConfigConsumerProps>(ConfigContext);

  const isLineType = type === "line";
  const isPureLineType = isLineType && !steps;
  const progressInfo = React.useMemo<React.ReactNode>(() => {
    if (!showInfo) {
      return null;
    }
    const computedSuccessPercent = getSuccessPercent({
      success,
      successPercent,
    });
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
        validProgress(computedSuccessPercent),
      );
    } else if (progressStatus === "exception") {
      text = isLineType ? (
        <Icon
          icon="icon-[ant-design--close-circle-filled]"
          className="text-red-500"
        />
      ) : (
        <Icon icon="icon-[lucide--x]" className="text-[1.2em] text-red-500" />
      );
    } else if (progressStatus === "success") {
      text = isLineType ? (
        <Icon
          icon="icon-[ant-design--check-circle-filled]"
          className="text-green-500"
        />
      ) : (
        <Icon
          icon="icon-[lucide--check]"
          className="text-[1.2em] text-green-500"
        />
      );
    }

    return (
      <span
        data-slot="progress-text"
        className={cn(
          "block",
          {
            // Line - Inner positioning
            "w-full px-2 font-medium text-white":
              isPureLineType && infoPosition === "inner",
            "text-left":
              isPureLineType &&
              infoPosition === "inner" &&
              infoAlign === "start",
            "text-center":
              isPureLineType &&
              infoPosition === "inner" &&
              infoAlign === "center",
            "text-right":
              isPureLineType && infoPosition === "inner" && infoAlign === "end",

            // Line - Outer positioning
            "ml-2": isPureLineType && infoPosition === "outer",
            "order-first mr-2 ml-0":
              isPureLineType &&
              infoPosition === "outer" &&
              infoAlign === "start",

            // Line - Font sizes
            "text-xs": isPureLineType && size === "small",
            "text-sm": isPureLineType && size !== "small",

            // Circle - text centered with relative font size (1em)
            "text-center text-[1em] font-medium":
              type === "circle" || type === "dashboard",
          },
          classNames?.text,
        )}
        title={typeof text === "string" ? text : undefined}
      >
        {text}
      </span>
    );
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

    if (success && "progress" in success) {
      warning.deprecated(false, "success.progress", "success.percent");
    }
  }

  let progress: React.ReactNode;

  if (!type || type === "line") {
    progress = (
      <>
        <ProgressPrimitive.Root
          data-slot="progress"
          value={percent}
          className={cn(
            "relative overflow-hidden rounded-full bg-[rgba(0,0,0,0.06)]",
            !sizeStyle.width && "w-full",
            className,
          )}
          style={{
            ...sizeStyle,
            ...(trailColor ? { backgroundColor: trailColor } : {}),
          }}
        >
          <ProgressPrimitive.Indicator
            data-slot="progress-indicator"
            className={cn(
              "h-full w-full flex-1 transition-all",
              // Default color when no strokeColor and no special status
              !strokeColor &&
                progressIndicatorVariants({ status: progressStatus }),
            )}
            style={{
              width: `${percent}%`,
              // Only apply strokeColor if status is not success/exception
              ...(progressStatus !== "success" &&
              progressStatus !== "exception" &&
              getStrokeColorStyle
                ? getStrokeColorStyle
                : {}),
            }}
            // style={{ transform: `translateX(-${100 - (percent || 0)}%)` }}
          >
            {infoPosition === "inner" && progressInfo}
          </ProgressPrimitive.Indicator>
        </ProgressPrimitive.Root>
        {infoPosition === "outer" && progressInfo}
      </>
    );
  } else if (type === "circle" || type === "dashboard") {
    progress = (
      <CircularProgress
        type={type}
        percent={percent}
        size={size}
        strokeColor={strokeColorNotArray}
        strokeLinecap={strokeLinecap}
        strokeWidth={strokeWidth}
        trailColor={trailColor}
        trailWidth={trailWidth}
        gapDegree={gapDegree}
        gapPosition={gapPosition}
        steps={steps}
        success={success}
        status={progressStatus}
        className={className}
        style={style}
      >
        {progressInfo}
      </CircularProgress>
    );
  }

  return (
    <div
      ref={ref}
      dir={direction}
      style={{ ...progressStyle?.style, ...style }}
      className={cn("relative", {
        "w-full": !sizeStyle.width,
        "inline-flex items-center": isLineType && infoPosition === "outer",
      })}
      role="progressbar"
      aria-valuenow={percentNumber}
      aria-valuemin={0}
      aria-valuemax={100}
      data-slot="progress-wrapper"
    >
      {progress}
    </div>
  );
}

export type { ProgressProps };
export { Progress };
