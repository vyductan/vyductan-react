export const DRAGGABLE_KEY = "draggable-key";

export const CAN_USE_DOM: boolean =
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  typeof window !== "undefined" &&
  typeof window.document !== "undefined" &&
  typeof window.document.createElement !== "undefined";
