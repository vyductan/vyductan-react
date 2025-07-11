/* eslint-disable react-hooks/react-compiler */
/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";

import type { InputRef } from "../types";

export default function useRemovePasswordTimeout(
  inputRef: React.RefObject<InputRef | null>,
  triggerOnMount?: boolean,
) {
  const removePasswordTimeoutRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const removePasswordTimeout = () => {
    removePasswordTimeoutRef.current.push(
      setTimeout(() => {
        if (
          inputRef.current?.input &&
          inputRef.current.input.getAttribute("type") === "password" &&
          inputRef.current.input.hasAttribute("value")
        ) {
          inputRef.current.input.removeAttribute("value");
        }
      }),
    );
  };

  useEffect(() => {
    if (triggerOnMount) {
      removePasswordTimeout();
    }

    return () =>
      removePasswordTimeoutRef.current.forEach((timer) => {
        if (timer) {
          clearTimeout(timer);
        }
      });
  }, []);

  return removePasswordTimeout;
}
