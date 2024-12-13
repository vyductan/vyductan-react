/* eslint-disable unicorn/no-null */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import React, { cloneElement, useRef } from "react";
import isVisible from "rc-util/lib/Dom/isVisible";
import { composeRef, supportRef } from "rc-util/lib/ref";

import type { WaveAllowedComponent } from "./interface";
import useWave from "./use-wave";

export interface WaveProps {
  disabled?: boolean;
  children?: React.ReactNode;
  component?: WaveAllowedComponent;
}

const Wave: React.FC<WaveProps> = (props) => {
  const { children, disabled, component } = props;
  const containerRef = useRef<HTMLElement>(null);

  // =============================== Wave ===============================
  const showWave = useWave(containerRef, "", component);

  // ============================== Effect ==============================
  React.useEffect(() => {
    const node = containerRef.current;
    if (!node || node.nodeType !== 1 || disabled) {
      return;
    }

    // Click handler
    const onClick = (e: MouseEvent) => {
      // Fix radio button click twice
      if (
        !isVisible(e.target as HTMLElement) ||
        // No need wave
        !node.getAttribute ||
        node.getAttribute("disabled") ||
        (node as HTMLInputElement).disabled ||
        // node.className.includes("disabled") ||
        node.className.includes("-leave")
      ) {
        return;
      }

      showWave(e);
    };

    // Bind events
    node.addEventListener("click", onClick, true);
    return () => {
      node.removeEventListener("click", onClick, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  // ============================== Render ==============================
  if (!React.isValidElement(children)) {
    return children ?? null;
  }

  const ref = supportRef(children)
    ? composeRef((children as any).props.ref, containerRef)
    : containerRef;

  return cloneElement<any>(children, { ref });
};

if (process.env.NODE_ENV !== "production") {
  Wave.displayName = "Wave";
}

export default Wave;
