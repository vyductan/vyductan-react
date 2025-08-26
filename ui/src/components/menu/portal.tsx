/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import * as React from "react";
import { createPortal } from "react-dom";

type PortalProps = {
  children: React.ReactNode;
  container?: HTMLElement | (() => HTMLElement) | null;
};

export function Portal({ children, container }: PortalProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  const getContainer = () => {
    if (typeof container === "function") {
      return container();
    }
    return container || document.body;
  };

  const target = getContainer();
  return target ? createPortal(children, target) : null;
}
