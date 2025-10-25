/* eslint-disable @typescript-eslint/no-unnecessary-condition */

import React, { cloneElement, useRef } from "react";
import isVisible from "@rc-component/util/lib/Dom/isVisible";
import { composeRef, getNodeRef, supportRef } from "@rc-component/util/lib/ref";

import type { WaveComponent } from "./interface";
import useWave from "./use-wave";

export interface WaveProps {
  disabled?: boolean;
  children?: React.ReactNode;
  component?: WaveComponent;
}

const Wave: React.FC<WaveProps> = (props) => {
  const { children, disabled, component } = props;
  const containerRef = useRef<HTMLElement>(null);

  // =============================== Wave ===============================
  const showWave = useWave(containerRef, "", component);

  // ============================== Effect ==============================
  React.useEffect(() => {
    const node = containerRef.current;
    if (node?.nodeType !== 1 || disabled) {
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
  }, [disabled, showWave]);

  // ============================== Render ==============================
  if (!React.isValidElement(children)) {
    return children ?? null;
  }

  const ref = supportRef(children)
    ? // eslint-disable-next-line react-hooks/refs
      composeRef(getNodeRef(children), containerRef)
    : containerRef;

  // eslint-disable-next-line react-hooks/refs, @typescript-eslint/no-explicit-any
  return cloneElement<any>(children, { ref });
};

if (process.env.NODE_ENV !== "production") {
  Wave.displayName = "Wave";
}

export default Wave;
