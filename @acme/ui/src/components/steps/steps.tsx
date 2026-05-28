"use client";

import type {
  CSSProperties,
  DetailedHTMLProps,
  HTMLAttributes,
  ReactNode,
} from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

import { cn } from "@acme/ui/lib/utils";

import { responsiveArray } from "../_util/responsive-observer";
import { CloseOutlined } from "../../icons";
import { CheckFilled } from "../../icons/check-filled";
import useBreakpoint from "../grid/hooks/use-breakpoint";

export type StepStatus = "wait" | "process" | "finish" | "error";
export type StepsDirection = "horizontal" | "vertical";
export type StepsSize = "small" | "default" | "large";
export type StepsTitlePlacement = "horizontal" | "vertical";

export type StepItemDef = {
  title: ReactNode;
  actions?: ReactNode;
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

type CSSVariableProperties = Record<`--${string}`, string | number>;
type StepsRailStyle = CSSProperties & CSSVariableProperties;

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
  size?: StepsSize;
  iconRender?: (oriNode: ReactNode, info: StepsIconRenderInfo) => ReactNode;
  items: StepItemDef[];
  classNames?: StepsSemanticClassNames;
  styles?: StepsSemanticStyles;
};

function getInferredStatus(index: number, current: number): StepStatus {
  if (index < current) {
    return "finish";
  }

  if (index === current) {
    return "process";
  }

  return "wait";
}

function getEffectiveTitlePlacement(
  direction: StepsDirection,
  titlePlacement: StepsTitlePlacement,
  responsive: boolean,
  screens: ReturnType<typeof useBreakpoint>,
): StepsTitlePlacement {
  if (direction === "vertical" || !responsive) {
    return titlePlacement;
  }

  const currentBreakpoint = responsiveArray.find((screen) => screens?.[screen]);

  if (currentBreakpoint === "xs") {
    return "vertical";
  }

  return titlePlacement;
}

const iconWidthBySize: Record<StepsSize, number> = {
  small: 24,
  default: 32,
  large: 56,
};

const statusIconMap: Record<
  Exclude<StepStatus, "wait" | "process">,
  ReactNode
> = {
  error: <CloseOutlined />,
  finish: <CheckFilled />,
};

function getGeneratedIconNode(
  itemStatus: StepStatus,
  index: number,
  title: ReactNode,
  shouldPromoteTitleToIcon: boolean,
): ReactNode {
  if (shouldPromoteTitleToIcon) {
    return <span className="px-3 py-1">{title}</span>;
  }

  if (itemStatus === "finish" || itemStatus === "error") {
    return statusIconMap[itemStatus];
  }

  return index + 1;
}

function getRailLayoutClassName(
  direction: StepsDirection,
  titlePlacement: StepsTitlePlacement,
  size: StepsSize,
): string {
  if (direction === "vertical") {
    return "ms-4 mt-2 h-12 w-px";
  }

  if (titlePlacement === "vertical") {
    return cn(
      "absolute left-[calc(50%+var(--steps-icon-half-width)+0.25rem)] h-px w-[calc(100%-var(--steps-icon-half-width)-var(--steps-next-icon-half-width)-0.5rem)]",
      size === "large" ? "top-7" : size === "small" ? "top-3" : "top-4",
    );
  }

  return "ms-4 mt-4 h-px min-w-8 flex-1";
}

function Steps(properties: StepsProps) {
  const {
    className,
    style,
    current = 0,
    direction = "horizontal",
    responsive = true,
    status,
    titlePlacement = "horizontal",
    size = "default",
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
  const iconElementsRef = useRef<Array<HTMLDivElement | null>>([]);
  const [iconWidths, setIconWidths] = useState<number[]>([]);
  const defaultIconWidth = iconWidthBySize[size];
  const measureIconWidths = useCallback(() => {
    setIconWidths((previousWidths) => {
      const nextWidths = items.map((_, index) => {
        const width =
          iconElementsRef.current[index]?.getBoundingClientRect().width;

        return width && width > 0 ? width : defaultIconWidth;
      });

      return previousWidths.length === nextWidths.length &&
        previousWidths.every((width, index) => width === nextWidths[index])
        ? previousWidths
        : nextWidths;
    });
  }, [defaultIconWidth, items]);

  useLayoutEffect(() => {
    measureIconWidths();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observers = iconElementsRef.current.flatMap((element) => {
      if (!element) {
        return [];
      }

      const observer = new ResizeObserver(measureIconWidths);
      observer.observe(element);
      return observer;
    });

    return () => {
      for (const observer of observers) {
        observer.disconnect();
      }
    };
  }, [measureIconWidths]);

  return (
    <div
      data-slot="steps"
      data-direction={direction}
      data-size={size}
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
        const active = index === current;
        const isDisabled = item.disabled === true;
        const isLast = index === items.length - 1;
        const hasActiveActions =
          active &&
          item.actions !== undefined &&
          item.actions !== null &&
          item.actions !== false;
        const hasCustomIcon = Object.hasOwn(item, "icon");
        const isHorizontalTitlePlacement =
          effectiveTitlePlacement === "horizontal";
        const shouldRenderRailInHeader =
          direction === "vertical" || !isHorizontalTitlePlacement;
        const shouldPromoteTitleToIcon =
          hasActiveActions &&
          effectiveTitlePlacement === "vertical" &&
          !hasCustomIcon;
        const shouldRenderActionsInSection =
          hasActiveActions &&
          (isHorizontalTitlePlacement || !shouldPromoteTitleToIcon);
        const oriNode = getGeneratedIconNode(
          itemStatus,
          index,
          item.title,
          shouldPromoteTitleToIcon,
        );
        const icon = hasCustomIcon
          ? item.icon
          : iconRender
            ? iconRender(oriNode, { index, active, item })
            : oriNode;
        const iconHalfWidth = (iconWidths[index] ?? defaultIconWidth) / 2;
        const nextIconHalfWidth =
          (iconWidths[index + 1] ?? defaultIconWidth) / 2;
        const railStyle: StepsRailStyle = {
          "--steps-icon-half-width": `${iconHalfWidth}px`,
          "--steps-next-icon-half-width": `${nextIconHalfWidth}px`,
          ...styles?.itemRail,
        };
        const rail = isLast ? undefined : (
          <div
            data-slot="steps-item-rail"
            className={cn(
              "bg-border transition-colors duration-300",
              getRailLayoutClassName(direction, effectiveTitlePlacement, size),
              itemStatus === "finish" && "bg-primary-600",
              classNames?.itemRail,
            )}
            style={railStyle}
          />
        );

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
                    : "w-full items-center",
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
                      : "items-center",
                  classNames?.itemHeader,
                )}
                style={styles?.itemHeader}
              >
                <div
                  data-slot="steps-item-icon"
                  ref={(element) => {
                    iconElementsRef.current[index] = element;
                  }}
                  className={cn(
                    "flex shrink-0 items-center justify-center rounded-full border font-medium transition-colors",
                    size === "large"
                      ? "min-h-14 min-w-14 text-xl"
                      : size === "small"
                        ? "min-h-6 min-w-6 text-xs"
                        : "min-h-8 min-w-8 text-sm",
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

                {shouldRenderRailInHeader ? rail : undefined}
              </div>

              <div
                data-slot="steps-item-section"
                className={cn(
                  "min-w-0",
                  direction === "vertical"
                    ? "ms-4"
                    : effectiveTitlePlacement === "vertical"
                      ? "mt-3 flex w-full flex-col items-center text-center"
                      : "ms-4 flex flex-col",
                  classNames?.itemSection,
                )}
                style={styles?.itemSection}
              >
                <div
                  data-slot="steps-item-title"
                  className={cn(
                    "font-medium",
                    size === "large" && "text-base",
                    size === "small" && "text-xs",
                    itemStatus === "wait"
                      ? "text-muted-foreground"
                      : "text-foreground",
                    classNames?.itemTitle,
                  )}
                  style={styles?.itemTitle}
                >
                  {shouldPromoteTitleToIcon ? item.actions : item.title}
                </div>
                {shouldRenderActionsInSection ? (
                  <div data-slot="steps-item-actions" className="mt-2">
                    {item.actions}
                  </div>
                ) : undefined}
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
                      "text-muted-foreground",
                      size === "large" ? "mt-0 w-full text-sm" : "mt-1",
                      size === "small" ? "text-xs" : "text-sm",
                      classNames?.itemContent,
                    )}
                    style={styles?.itemContent}
                  >
                    {item.content}
                  </div>
                ) : undefined}
              </div>
              {shouldRenderRailInHeader ? undefined : rail}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { Steps };
