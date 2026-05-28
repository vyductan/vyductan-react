import * as React from "react";
import { createPortal } from "react-dom";

type PortalProps = {
  children: React.ReactNode;
  container?: HTMLElement | (() => HTMLElement) | null;
};

type MountStore = {
  getSnapshot: () => boolean;
  subscribe: (onStoreChange: () => void) => () => void;
};

function createMountStore(): MountStore {
  let mounted = false;

  return {
    getSnapshot() {
      return mounted;
    },
    subscribe(onStoreChange) {
      mounted = true;
      onStoreChange();

      return () => {
        mounted = false;
      };
    },
  };
}

function getServerSnapshot() {
  return false;
}

export function Portal({ children, container }: PortalProps) {
  const mountStore = React.useMemo(() => createMountStore(), []);
  const mounted = React.useSyncExternalStore(
    mountStore.subscribe,
    mountStore.getSnapshot,
    getServerSnapshot,
  );

  if (!mounted) return;

  const target =
    typeof container === "function"
      ? container()
      : (container ?? document.body);

  return target ? createPortal(children, target) : undefined;
}
