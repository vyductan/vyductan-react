import React from "react";
import raf from "rc-util/es/raf";

/**
 * When click on the label,
 * the event will be stopped to prevent the label from being clicked twice.
 * label click -> input click -> label click again
 */
export default function useBubbleLock(
  onOriginInputClick?: React.MouseEventHandler<HTMLButtonElement>,
) {
  const labelClickLockReference = React.useRef<number | undefined>(undefined);

  const clearLock = () => {
    if (labelClickLockReference.current !== undefined) {
      raf.cancel(labelClickLockReference.current);
    }
    labelClickLockReference.current = undefined;
  };

  const onLabelClick: React.MouseEventHandler<HTMLLabelElement> = () => {
    clearLock();

    labelClickLockReference.current = raf(() => {
      labelClickLockReference.current = undefined;
    });
  };

  const onInputClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (labelClickLockReference.current) {
      e.stopPropagation();
      clearLock();
    }

    onOriginInputClick?.(e);
  };

  return [onLabelClick, onInputClick] as const;
}
