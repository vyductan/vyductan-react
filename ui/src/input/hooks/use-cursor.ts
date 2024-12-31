import { useRef } from "react";
import warning from "rc-util/lib/warning";

/**
 * Keep input cursor in the correct position if possible.
 * Is this necessary since we have `formatter` which may mass the content?
 */
export default function useCursor(
  input: HTMLInputElement | null,
  focused: boolean,
): [() => void, () => void] {
  const selectionRef = useRef<{
    start: number | null;
    end: number | null;
    value?: string;
    beforeTxt?: string;
    afterTxt?: string;
  } | null>(null);

  function recordCursor() {
    // Record position
    try {
      if (input) {
        const { selectionStart: start, selectionEnd: end, value } = input;
        const beforeTxt = value.slice(
          0,
          Math.max(0, typeof start === "number" ? start : 0),
        );
        const afterTxt =
          typeof end === "number" ? value.slice(Math.max(0, end)) : "";

        selectionRef.current = {
          start,
          end,
          value,
          beforeTxt,
          afterTxt,
        };
      }
    } catch {
      // Fix error in Chrome:
      // Failed to read the 'selectionStart' property from 'HTMLInputElement'
      // http://stackoverflow.com/q/21177489/3040605
    }
  }

  /**
   * Restore logic:
   *  1. back string same
   *  2. start string same
   */
  function restoreCursor() {
    if (input && selectionRef.current && focused) {
      try {
        const { value } = input;
        const { beforeTxt, afterTxt, start } = selectionRef.current;

        let startPos = value.length;

        if (beforeTxt && value.startsWith(beforeTxt)) {
          startPos = beforeTxt.length;
        } else if (afterTxt && value.endsWith(afterTxt)) {
          startPos = value.length - afterTxt.length;
        } else if (beforeTxt && start) {
          const beforeLastChar = beforeTxt[start - 1];
          if (beforeLastChar) {
            const newIndex = value.indexOf(beforeLastChar, start - 1);
            if (newIndex !== -1) {
              startPos = newIndex + 1;
            }
          }
        }

        input.setSelectionRange(startPos, startPos);
      } catch (error) {
        warning(
          false,
          `Something warning of cursor restore. Please fire issue about this: ${(error as Error).message}`,
        );
      }
    }
  }

  return [recordCursor, restoreCursor];
}
