/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable unicorn/prefer-global-this */
export const DRAGGABLE_KEY = "draggable-key";

export const CAN_USE_DOM: boolean =
  typeof window !== "undefined" &&
  window.document !== undefined &&
  window.document.createElement !== undefined;
