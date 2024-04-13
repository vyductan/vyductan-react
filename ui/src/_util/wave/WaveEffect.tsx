import * as React from "react";
import { cubicBezier, motion } from "framer-motion";
import raf from "rc-util/lib/raf";
import { render, unmount } from "rc-util/lib/React/render";

import type { ShowWaveEffect, WaveAllowedComponent } from "./interface";
import { getTargetWaveColor, isNotGrey } from "./util";

function validateNum(value: number) {
  return Number.isNaN(value) ? 0 : value;
}

export interface WaveEffectProps {
  className: string;
  target: HTMLElement;
  component?: WaveAllowedComponent;
}

const WaveEffect: React.FC<WaveEffectProps> = (props) => {
  const { className, target, component } = props;
  const divRef = React.useRef<HTMLDivElement>(null);

  const [color, setWaveColor] = React.useState<string | null>(null);
  const [borderRadius, setBorderRadius] = React.useState<number[]>([]);
  const [left, setLeft] = React.useState(0);
  const [top, setTop] = React.useState(0);
  const [width, setWidth] = React.useState(0);
  const [height, setHeight] = React.useState(0);
  const [enabled, setEnabled] = React.useState(false);

  const waveStyle = {
    left,
    top,
    width,
    height,
    borderRadius: borderRadius.map((radius) => `${radius}px`).join(" "),
  } as React.CSSProperties & Record<string, number | string>;

  // if (color) {
  //   waveStyle["--wave-color"] = color;
  // }

  function syncPos() {
    const nodeStyle = getComputedStyle(target);

    // Get wave color from target
    setWaveColor(getTargetWaveColor(target));

    const isStatic = nodeStyle.position === "static";

    // Rect
    const { borderLeftWidth, borderTopWidth } = nodeStyle;
    setLeft(
      isStatic ? target.offsetLeft : validateNum(-parseFloat(borderLeftWidth)),
    );
    setTop(
      isStatic ? target.offsetTop : validateNum(-parseFloat(borderTopWidth)),
    );
    setWidth(target.offsetWidth);
    setHeight(target.offsetHeight);

    // Get border radius
    const {
      borderTopLeftRadius,
      borderTopRightRadius,
      borderBottomLeftRadius,
      borderBottomRightRadius,
    } = nodeStyle;

    setBorderRadius(
      [
        borderTopLeftRadius,
        borderTopRightRadius,
        borderBottomRightRadius,
        borderBottomLeftRadius,
      ].map((radius) => validateNum(parseFloat(radius))),
    );
  }

  React.useEffect(() => {
    if (target) {
      // We need delay to check position here
      // since UI may change after click
      const id = raf(() => {
        syncPos();

        setEnabled(true);
      });

      // Add resize observer to follow size
      let resizeObserver: ResizeObserver;
      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(syncPos);

        resizeObserver.observe(target);
      }

      return () => {
        raf.cancel(id);
        resizeObserver?.disconnect();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!enabled) {
    return null;
  }

  const isSmallComponent = component === "Checkbox" || component === "Radio";

  // styles
  // https://github.com/ant-design/ant-design/blob/2c029eacada8446da060ca3953400a2f2c02ab07/components/_util/wave/style.ts#L22
  // https://github.com/ant-design/ant-design/blob/2c029eacada8446da060ca3953400a2f2c02ab07/components/theme/themes/seed.ts#L48C23-L48C56
  const easeOutCirc = cubicBezier(0.08, 0.82, 0.17, 1);
  const easeInOut = cubicBezier(0.645, 0.045, 0.355, 1);

  const inititalOpacity = isNotGrey(color ?? "") ? 0.2 : 0.6;

  return (
    <motion.div
      ref={divRef}
      className={className}
      style={waveStyle}
      initial={{ opacity: inititalOpacity }}
      animate={{
        position: "absolute",
        boxShadow: "0 0 0 6px " + color,
        opacity: 0,
        transition: !isSmallComponent
          ? {
              boxShadow: {
                ease: easeOutCirc,
                duration: 0.4,
              },
              opacity: {
                ease: easeOutCirc,
                duration: 2,
              },
            }
          : {
              boxShadow: {
                ease: easeInOut,
                duration: 0.3,
              },
              opacity: {
                ease: easeInOut,
                duration: 0.35,
              },
            },
      }}
      onAnimationComplete={() => {
        const holder = divRef.current?.parentElement;
        void unmount(holder!).then(() => {
          holder?.remove();
        });
      }}
    />
  );
};

const showWaveEffect: ShowWaveEffect = (target, info) => {
  const { component } = info;

  // Skip for unchecked checkbox
  if (component === "Checkbox" && !target.querySelector("input")?.checked) {
    return;
  }

  // Create holder
  const holder = document.createElement("div");
  holder.style.position = "absolute";
  holder.style.left = "0px";
  holder.style.top = "0px";
  target?.insertBefore(holder, target?.firstChild);

  render(<WaveEffect {...info} target={target} />, holder);
};

export default showWaveEffect;
