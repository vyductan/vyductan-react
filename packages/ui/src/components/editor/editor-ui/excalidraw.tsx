/* eslint-disable unicorn/no-null -- Lexical APIs and serialized editor fixtures intentionally use null semantics. */
"use client";

import type { ExcalidrawProps } from "@excalidraw/excalidraw/types";
import type { ComponentType } from "react";
import { useEffect, useState } from "react";

// Client-only wrapper for Excalidraw to prevent SSR issues
function ClientOnlyExcalidraw(
  properties: ExcalidrawProps & { fallback?: React.ReactNode },
) {
  const [ExcalidrawComponent, setExcalidrawComponent] =
    useState<ComponentType<ExcalidrawProps> | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Only import Excalidraw on the client side (useEffect only runs on client)
    import("@excalidraw/excalidraw")
      .then((module_) => {
        setExcalidrawComponent(() => module_.Excalidraw);
      })
      .catch((error) => {
        console.error("Failed to load Excalidraw:", error);
      });
  }, []);

  if (!isMounted || !ExcalidrawComponent) {
    return (properties.fallback ?? (
      <div className="flex h-full w-full items-center justify-center">
        Loading...
      </div>
    )) as React.ReactElement;
  }

  return <ExcalidrawComponent {...properties} />;
}

export { ClientOnlyExcalidraw as Excalidraw };
