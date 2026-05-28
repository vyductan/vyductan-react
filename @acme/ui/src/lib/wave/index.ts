import React, { cloneElement, useRef } from "react";
import isVisible from "@rc-component/util/es/Dom/isVisible";
import { composeRef, getNodeRef, supportRef } from "@rc-component/util/es/ref";

import type { WaveComponent } from "./interface";
import useWave from "./use-wave";

export interface WaveProps {
  disabled?: boolean;
  children?: React.ReactNode;
  component?: WaveComponent;
}

const Wave: React.FC<WaveProps> = (properties) => {
  const { children, disabled, component } = properties;
  const containerReference = useRef<HTMLElement>(null);

  // =============================== Wave ===============================
  const showWave = useWave(containerReference, "", component);

  // ============================== Effect ==============================
  React.useEffect(() => {
    const node = containerReference.current;
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
    return children ?? undefined;
  }

  const reference = supportRef(children)
    ? // eslint-disable-next-line react-hooks/refs
      composeRef(getNodeRef(children), containerReference)
    : containerReference;

  // eslint-disable-next-line react-hooks/refs, @typescript-eslint/no-explicit-any
  return cloneElement<any>(children, { ref: reference });
};

if (process.env.NODE_ENV !== "production") {
  Wave.displayName = "Wave";
}

export default Wave;
