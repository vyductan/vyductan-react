/* eslint-disable unicorn/no-array-for-each */

/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";

import type { InputRef as InputReference } from "../types";

export default function useRemovePasswordTimeout(
  inputReference: React.RefObject<InputReference | null>,
  triggerOnMount?: boolean,
) {
  const removePasswordTimeoutReference = useRef<
    ReturnType<typeof setTimeout>[]
  >([]);
  const removePasswordTimeout = () => {
    removePasswordTimeoutReference.current.push(
      setTimeout(() => {
        if (
          inputReference.current?.input?.getAttribute("type") === "password" &&
          inputReference.current.input.hasAttribute("value")
        ) {
          inputReference.current.input.removeAttribute("value");
        }
      }),
    );
  };

  useEffect(() => {
    if (triggerOnMount) {
      removePasswordTimeout();
    }

    return () =>
      removePasswordTimeoutReference.current.forEach((timer) => {
        if (timer) {
          clearTimeout(timer);
        }
      });
  }, []);

  return removePasswordTimeout;
}
