/* eslint-disable react-compiler/react-compiler */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
// Jun 15, 2024
import * as React from "react";
import raf from "@rc-component/util/lib/raf";
import { motion } from "motion/react";

import type { UnmountType } from "../../config-provider/unstable-context";
import type { ShowWaveEffect, WaveComponent } from "./interface";
import { getReactRender } from "../../config-provider/unstable-context";
import { TARGET_CLS } from "./interface";
import {
  motionDurationSlow,
  motionEaseInOut,
  motionEaseOutCirc,
} from "./token";
import { getTargetWaveColor } from "./util";

function validateNum(value: number) {
  return Number.isNaN(value) ? 0 : value;
}

export interface WaveEffectProps {
  className: string;
  target: HTMLElement;
  component?: WaveComponent;
  registerUnmount: () => UnmountType | null;
}

const WaveEffect: React.FC<WaveEffectProps> = (props) => {
  const { className, target, component, registerUnmount } = props;
  const divRef = React.useRef<HTMLDivElement>(null);

  // ====================== Refs ======================
  const unmountRef = React.useRef<UnmountType>(null);

  React.useEffect(() => {
    unmountRef.current = registerUnmount();
  }, []);

  // ===================== Effect =====================
  const [color, setWaveColor] = React.useState<string | null>(null);
  const [borderRadius, setBorderRadius] = React.useState<number[]>([]);
  const [left, setLeft] = React.useState(0);
  const [top, setTop] = React.useState(0);
  const [width, setWidth] = React.useState(0);
  const [height, setHeight] = React.useState(0);
  const [enabled, setEnabled] = React.useState(false);

  const waveStyle: React.CSSProperties = {
    left,
    top,
    width,
    height,
    borderRadius: borderRadius.map((radius) => `${radius}px`).join(" "),
  };

  if (color) {
    (waveStyle as Record<string, string>)["--wave-color"] = color;
  }

  function syncPos() {
    const nodeStyle = getComputedStyle(target);

    // console.log("cccc", getTargetWaveColor(target));
    // Get wave color from target
    setWaveColor(getTargetWaveColor(target));

    const isStatic = nodeStyle.position === "static";

    // Rect
    const { borderLeftWidth, borderTopWidth } = nodeStyle;
    setLeft(
      isStatic
        ? target.offsetLeft
        : validateNum(-Number.parseFloat(borderLeftWidth)),
    );
    setTop(
      isStatic
        ? target.offsetTop
        : validateNum(-Number.parseFloat(borderTopWidth)),
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
      ].map((radius) => validateNum(Number.parseFloat(radius))),
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
  }, []);

  if (!enabled) {
    return null;
  }

  if (!enabled) {
    return null;
  }

  // use for wave-quick or not
  const isSmallComponent =
    (component === "Checkbox" || component === "Radio") &&
    target?.classList.contains(TARGET_CLS);

  return (
    <motion.div
      ref={divRef}
      className={className}
      style={waveStyle}
      initial={{
        position: "absolute",
        background: "transparent",
        pointerEvents: "none",
        boxSizing: "border-box",
        color: `var(--wave-color, --color-primary-600)`,
        opacity: 0.2,
        boxShadow: "0 0 0 0 currentColor",
      }}
      animate={{
        boxShadow: "0 0 0 6px currentColor",
        opacity: 0,
        transition: isSmallComponent
          ? {
              boxShadow: {
                ease: motionEaseInOut,
                duration: motionDurationSlow,
              },
              opacity: {
                ease: motionEaseInOut,
                duration: motionDurationSlow,
              },
            }
          : {
              boxShadow: {
                ease: motionEaseOutCirc,
                duration: 0.4,
              },
              opacity: {
                ease: motionEaseOutCirc,
                duration: 2,
              },
            },
      }}
      onAnimationComplete={() => {
        const holder = divRef.current?.parentElement;
        void unmountRef.current?.().then(() => {
          holder?.remove();
        });
      }}
    />
  );
};

const showWaveEffect: ShowWaveEffect = (target, info) => {
  const { component } = info;

  // Skip for unchecked checkbox
  if (
    component === "Checkbox" &&
    !target.querySelector<HTMLInputElement>("input")?.checked
  ) {
    return;
  }

  // Create holder
  const holder = document.createElement("div");
  holder.style.position = "absolute";
  holder.style.left = "0px";
  holder.style.top = "0px";
  target?.insertBefore(holder, target?.firstChild);

  const reactRender = getReactRender();

  let unmountCallback: UnmountType | null = null;

  function registerUnmount() {
    return unmountCallback;
  }

  unmountCallback = reactRender(
    <WaveEffect {...info} target={target} registerUnmount={registerUnmount} />,
    holder,
  );
};

export default showWaveEffect;
