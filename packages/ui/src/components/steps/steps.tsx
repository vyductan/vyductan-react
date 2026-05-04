"use client";

import type {
  CSSProperties,
  DetailedHTMLProps,
  HTMLAttributes,
  ReactNode,
} from "react";

import { cn } from "@acme/ui/lib/utils";

import { responsiveArray } from "../_util/responsive-observer";
import { CloseOutlined } from "../../icons";
import { CheckFilled } from "../../icons/check-filled";
import useBreakpoint from "../grid/hooks/use-breakpoint";

export type StepStatus = "wait" | "process" | "finish" | "error";
export type StepsDirection = "horizontal" | "vertical";
export type StepsTitlePlacement = "horizontal" | "vertical";

export type StepItemDef = {
  title: ReactNode;
  content?: ReactNode;
  subTitle?: ReactNode;
  icon?: ReactNode;
  status?: StepStatus;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
};

export type StepsIconRenderInfo = {
  index: number;
  active: boolean;
  item: StepItemDef;
};

export type StepsSemanticClassNames = {
  root?: string;
  item?: string;
  itemWrapper?: string;
  itemSection?: string;
  itemHeader?: string;
  itemIcon?: string;
  itemTitle?: string;
  itemSubtitle?: string;
  itemContent?: string;
  itemRail?: string;
};

export type StepsSemanticStyles = {
  root?: CSSProperties;
  item?: CSSProperties;
  itemWrapper?: CSSProperties;
  itemSection?: CSSProperties;
  itemHeader?: CSSProperties;
  itemIcon?: CSSProperties;
  itemTitle?: CSSProperties;
  itemSubtitle?: CSSProperties;
  itemContent?: CSSProperties;
  itemRail?: CSSProperties;
};

export type StepsProps = DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  current?: number;
  direction?: StepsDirection;
  responsive?: boolean;
  status?: StepStatus;
  titlePlacement?: StepsTitlePlacement;
  iconRender?: (oriNode: ReactNode, info: StepsIconRenderInfo) => ReactNode;
  items: StepItemDef[];
  classNames?: StepsSemanticClassNames;
  styles?: StepsSemanticStyles;
};

const getInferredStatus = (index: number, current: number): StepStatus => {
  if (index < current) {
    return "finish";
  }

  if (index === current) {
    return "process";
  }

  return "wait";
};

const getEffectiveTitlePlacement = (
  direction: StepsDirection,
  titlePlacement: StepsTitlePlacement,
  responsive: boolean,
  screens: ReturnType<typeof useBreakpoint>,
): StepsTitlePlacement => {
  if (direction === "vertical" || !responsive) {
    return titlePlacement;
  }

  const currentBreakpoint = responsiveArray.find((screen) => screens?.[screen]);

  if (currentBreakpoint === "xs") {
    return "vertical";
  }

  return titlePlacement;
};

const statusIconMap: Record<
  Exclude<StepStatus, "wait" | "process">,
  ReactNode
> = {
  error: <CloseOutlined />,
  finish: <CheckFilled />,
};

const Steps = (properties: StepsProps) => {
  const {
    className,
    style,
    current = 0,
    direction = "horizontal",
    responsive = true,
    status,
    titlePlacement = "horizontal",
    iconRender,
    items,
    classNames,
    styles,
    ...rest
  } = properties;

  const screens = useBreakpoint(responsive);
  const effectiveTitlePlacement = getEffectiveTitlePlacement(
    direction,
    titlePlacement,
    responsive,
    screens,
  );

  return (
    <div
      data-slot="steps"
      data-direction={direction}
      className={cn(
        "flex w-full",
        direction === "horizontal" ? "items-start" : "flex-col",
        className,
        classNames?.root,
      )}
      style={{
        ...styles?.root,
        ...style,
      }}
      {...rest}
    >
      {items.map((item, index) => {
        const itemStatus =
          item.status ??
          (status && index === current ? status : undefined) ??
          getInferredStatus(index, current);
        const isDisabled = item.disabled === true;
        const isLast = index === items.length - 1;
        const oriNode =
          itemStatus === "finish" || itemStatus === "error"
            ? statusIconMap[itemStatus]
            : index + 1;
        const icon = Object.hasOwn(item, "icon")
          ? item.icon
          : iconRender
            ? iconRender(oriNode, { index, active: index === current, item })
            : oriNode;

        return (
          <div
            data-slot="steps-item"
            data-status={itemStatus}
            data-disabled={isDisabled ? "true" : undefined}
            data-direction={direction}
            key={index}
            className={cn(
              "flex min-w-0",
              direction === "horizontal"
                ? cn(
                    "relative flex-1 items-start",
                    effectiveTitlePlacement !== "vertical" && "last:flex-none",
                  )
                : "w-full",
              itemStatus === "wait" && "text-muted-foreground",
              item.className,
              classNames?.item,
            )}
            style={{
              ...styles?.item,
              ...item.style,
            }}
          >
            <div
              data-slot="steps-item-wrapper"
              className={cn(
                "flex min-w-0",
                direction === "vertical"
                  ? "w-full items-start"
                  : effectiveTitlePlacement === "vertical"
                    ? "w-full flex-col items-center"
                    : "items-center",
                classNames?.itemWrapper,
              )}
              style={styles?.itemWrapper}
            >
              <div
                data-slot="steps-item-header"
                data-title-placement={effectiveTitlePlacement}
                className={cn(
                  "flex min-w-0 shrink-0",
                  direction === "vertical"
                    ? "flex-col items-center"
                    : effectiveTitlePlacement === "vertical"
                      ? "w-full flex-col items-center"
                      : "flex-1 items-center",
                  classNames?.itemHeader,
                )}
                style={styles?.itemHeader}
              >
                <div
                  data-slot="steps-item-icon"
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium transition-colors",
                    itemStatus === "process" &&
                      "border-primary-600 bg-primary-600 text-white",
                    itemStatus === "finish" &&
                      "border-primary-200 bg-primary-200 text-primary-600",
                    itemStatus === "error" &&
                      "border-destructive bg-destructive text-white",
                    itemStatus === "wait" &&
                      "border-border bg-muted text-muted-foreground",
                    isDisabled && "opacity-50",
                    classNames?.itemIcon,
                  )}
                  style={styles?.itemIcon}
                >
                  {icon}
                </div>

                {!isLast && (
                  <div
                    data-slot="steps-item-rail"
                    className={cn(
                      "bg-border transition-colors duration-300",
                      direction === "vertical"
                        ? "ms-4 mt-2 h-12 w-px"
                        : effectiveTitlePlacement === "vertical"
                          ? "absolute left-[calc(50%+1rem+0.25rem)] top-4 h-px w-[calc(100%-2rem-0.5rem)]"
                          : "mx-4 h-px w-full min-w-8",
                      itemStatus === "finish" && "bg-primary-600",
                      classNames?.itemRail,
                    )}
                    style={styles?.itemRail}
                  />
                )}
              </div>

              <div
                data-slot="steps-item-section"
                className={cn(
                  "min-w-0",
                  direction === "vertical"
                    ? "ms-4"
                    : effectiveTitlePlacement === "vertical"
                      ? "mt-3 flex w-full flex-col items-center text-center"
                      : "ms-4 flex flex-1 flex-col",
                  classNames?.itemSection,
                )}
                style={styles?.itemSection}
              >
                <div
                  data-slot="steps-item-title"
                  className={cn(
                    "text-foreground font-medium",
                    classNames?.itemTitle,
                  )}
                  style={styles?.itemTitle}
                >
                  {item.title}
                </div>
                {item.subTitle ? (
                  <div
                    data-slot="steps-item-subtitle"
                    className={cn(
                      "text-muted-foreground text-xs",
                      classNames?.itemSubtitle,
                    )}
                    style={styles?.itemSubtitle}
                  >
                    {item.subTitle}
                  </div>
                ) : undefined}

                {item.content ? (
                  <div
                    data-slot="steps-item-content"
                    className={cn(
                      "text-muted-foreground mt-1 text-sm",
                      classNames?.itemContent,
                    )}
                    style={styles?.itemContent}
                  >
                    {item.content}
                  </div>
                ) : undefined}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export { Steps };
