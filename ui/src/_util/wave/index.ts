/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React, { cloneElement, useRef } from "react";
import isVisible from "rc-util/lib/Dom/isVisible";
import { composeRef, supportRef } from "rc-util/lib/ref";

import type { WaveAllowedComponent } from "./interface";
import useWave from "./useWave";

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
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
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
    ? composeRef((children as any).ref, containerRef)
    : containerRef;

  return cloneElement<any>(children, { ref });
};

if (process.env.NODE_ENV !== "production") {
  Wave.displayName = "Wave";
}

export default Wave;
