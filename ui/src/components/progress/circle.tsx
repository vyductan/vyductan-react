/* eslint-disable unicorn/no-new-array */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable unicorn/prefer-at */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import React from "react";
import useId from "@rc-component/util/lib/hooks/useId";

import { cn } from "@acme/ui/lib/utils";

import type { ProgressGradient, ProgressProps } from "./progress";
import { Tooltip } from "../tooltip";
import PtgCircle from "./circle/ptg-circle";
import { getCircleStyle, VIEW_BOX_SIZE } from "./circle/util";
import { useTransitionDuration } from "./hooks/use-transition-duration";
import { getPercentage, getSize, getStrokeColor } from "./utils";
import getIndeterminateCircle from "./utils/get-indeterminate-circle";

const CIRCLE_MIN_STROKE_WIDTH = 3;

interface CircleProps extends Omit<ProgressProps, "format" | "ref"> {
  children?: React.ReactNode;
  progressStatus: string;
  strokeColor?: string | ProgressGradient;

  gapDegree?: number;
}

function Circle(props: CircleProps) {
  const {
    id,
    children,
    steps,
    // max = 100,
    // min = 0,
    size = 100,
    gapPosition: gapPositionProp,

    // gaugePrimaryColor,
    // gaugeSecondaryColor,
    // strokeColor,
    strokeLinecap,
    trailColor = null as unknown as string,
    trailWidth,
    className,
    type,
    loading,
    success,

    gapDegree: gapDegreeProp = 0,
    classNames,
    styles,
    style,
    ...restProps
  } = props;
  const [width, height] = getSize(size, "circle");

  let { strokeWidth } = props;
  if (strokeWidth === undefined) {
    strokeWidth = Math.max(getMinPercent(width), 6);
  }

  const circleStyle: React.CSSProperties = {
    width,
    height,
    fontSize: width * 0.15 + 6,
  };

  const realGapDegree = React.useMemo(() => {
    // Support gapDeg = 0 when type = 'dashboard'
    if (gapDegreeProp || gapDegreeProp === 0) {
      return gapDegreeProp;
    }
    if (type === "dashboard") {
      return 75;
    }
    return 0;
  }, [gapDegreeProp, type]);

  const percentArray = getPercentage(props);
  const gapPos =
    gapPositionProp || (type === "dashboard" && "bottom") || undefined;

  // using className to style stroke color
  const isGradient =
    Object.prototype.toString.call(props.strokeColor) === "[object Object]";
  const strokeColor = getStrokeColor({
    success,
    strokeColor: props.strokeColor,
  });

  const wrapperClassName = cn(`circle-inner`, {
    ["circle-gradient"]: isGradient,
  });

  const smallCircle = width <= 20;

  // Calculate stroke width based on size, similar to Ant Design
  // const getStrokeWidth = (circleSize: number) => {
  //   const minStrokeWidth = 3; // Minimum stroke width in pixels
  //   const defaultStrokeWidth = 6; // Default stroke width in pixels
  //   const minSize = 20; // Minimum size where we start scaling down the stroke width

  //   if (circleSize <= minSize) {
  //     return minStrokeWidth;
  //   }

  //   // Scale stroke width with size, but keep it between min and default
  //   const calculatedWidth = Math.max(
  //     minStrokeWidth,
  //     Math.min(defaultStrokeWidth, Math.floor(circleSize * 0.06)) // 6% of size, max 6px
  //   );

  //   return calculatedWidth;
  // };

  // const strokeWidth = getStrokeWidth(size);
  // const radius = size / 2 - strokeWidth * 2; // Adjust radius based on stroke width

  // ======= RC Props =====
  const percent = percentArray;
  const gapDegree = realGapDegree ?? 0;
  const gapPosition = gapPos;
  // ======= RC ======
  const halfSize = VIEW_BOX_SIZE / 2;

  const mergedId = useId(id);
  const gradientId = `${mergedId}-gradient`;

  const radius = halfSize - strokeWidth / 2;
  const perimeter = Math.PI * 2 * radius;
  const rotateDeg = gapDegree > 0 ? 90 + gapDegree / 2 : -90;
  const perimeterWithoutGap = perimeter * ((360 - gapDegree) / 360);
  const { count: stepCount, gap: stepGap } =
    typeof steps === "object" ? steps : { count: steps!, gap: 2 };

  const percentList = toArray(percent);
  const strokeColorList = toArray(strokeColor);
  const gradient = strokeColorList.find(
    (color) => color && typeof color === "object",
  ) as Record<string, string>;
  const isConicGradient = gradient && typeof gradient === "object";
  const mergedStrokeLinecap = isConicGradient ? "butt" : strokeLinecap;
  const { indeterminateStyleProps, indeterminateStyleAnimation } =
    getIndeterminateCircle({
      id: mergedId,
      loading,
    });

  const rcCircleStyle = getCircleStyle(
    perimeter,
    perimeterWithoutGap,
    0,
    100,
    rotateDeg,
    gapDegree,
    gapPosition,
    trailColor,
    mergedStrokeLinecap,
    strokeWidth,
  );

  const paths = useTransitionDuration();

  const getStokeList = () => {
    let stackPtg = 0;
    return percentList
      .map<React.ReactNode>((ptg, index) => {
        const color = (strokeColorList[index] ||
          strokeColorList[strokeColorList.length - 1])!;
        const circleStyleForStack = getCircleStyle(
          perimeter,
          perimeterWithoutGap,
          stackPtg,
          ptg,
          rotateDeg,
          gapDegree,
          gapPosition,
          color,
          mergedStrokeLinecap,
          strokeWidth,
        );
        stackPtg += ptg;

        return (
          <PtgCircle
            key={index}
            color={color}
            ptg={ptg}
            radius={radius}
            gradientId={gradientId}
            className={classNames?.track}
            style={{
              ...circleStyleForStack,
              ...indeterminateStyleProps,
              ...styles?.track,
            }}
            strokeLinecap={mergedStrokeLinecap}
            strokeWidth={strokeWidth}
            gapDegree={gapDegree}
            ref={(elem) => {
              // https://reactjs.org/docs/refs-and-the-dom.html#callback-refs
              // React will call the ref callback with the DOM element when the component mounts,
              // and call it with `null` when it unmounts.
              // Refs are guaranteed to be up-to-date before componentDidMount or componentDidUpdate fires.

              paths[index] = elem!;
            }}
            size={VIEW_BOX_SIZE}
          />
        );
      })
      .reverse();
  };

  const getStepStokeList = () => {
    // only show the first percent when pass steps
    const current = Math.round(stepCount * (percentList[0]! / 100));
    const stepPtg = 100 / stepCount;

    let stackPtg = 0;
    return new Array(stepCount).fill(null).map<React.ReactNode>((_, index) => {
      const color = index <= current - 1 ? strokeColorList[0]! : trailColor;
      const stroke =
        color && typeof color === "object" ? `url(#${gradientId})` : undefined;
      const circleStyleForStack = getCircleStyle(
        perimeter,
        perimeterWithoutGap,
        stackPtg,
        stepPtg,
        rotateDeg,
        gapDegree,
        gapPosition,
        color,
        "butt",
        strokeWidth,
        stepGap,
      );
      stackPtg +=
        ((perimeterWithoutGap -
          (circleStyleForStack.strokeDashoffset as number) +
          stepGap) *
          100) /
        perimeterWithoutGap;

      return (
        <circle
          key={index}
          className={cn(`stroke-(--progress-default-color)`, classNames?.track)}
          r={radius}
          cx={halfSize}
          cy={halfSize}
          stroke={stroke}
          strokeWidth={strokeWidth}
          opacity={1}
          style={{ ...circleStyleForStack, ...styles?.track }}
          ref={(elem) => {
            paths[index] = elem!;
          }}
        />
      );
    });
  };

  const circleContent = (
    <svg
      className={cn(classNames?.root, className)}
      viewBox={`0 0 ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}`}
      style={{
        ...styles?.root,
        ...style,
      }}
      id={id}
      role="presentation"
      {...restProps}
    >
      {!stepCount && (
        <circle
          className={cn(`circle-rail`, classNames?.rail)}
          r={radius}
          cx={halfSize}
          cy={halfSize}
          stroke={trailColor}
          strokeLinecap={mergedStrokeLinecap}
          strokeWidth={trailWidth || strokeWidth}
          style={{
            ...circleStyle,
            ...rcCircleStyle,
            ...styles?.rail,
          }}
        />
      )}
      {stepCount ? getStepStokeList() : getStokeList()}
      {indeterminateStyleAnimation}
    </svg>
  );

  const node = (
    <div className={wrapperClassName} style={circleStyle}>
      {circleContent}
      {!smallCircle && children}
    </div>
  );

  if (smallCircle) {
    return <Tooltip title={children}>{node}</Tooltip>;
  }

  return node;
}

const getMinPercent = (width: number): number =>
  (CIRCLE_MIN_STROKE_WIDTH / width) * 100;

function toArray<T>(value: T | T[]): T[] {
  const mergedValue = value ?? [];
  return Array.isArray(mergedValue) ? mergedValue : [mergedValue];
}

export type { CircleProps };
export { Circle as CircularProgress };
