export const DRAGGABLE_KEY = "draggable-key";

export const CAN_USE_DOM: boolean =
  typeof window !== "undefined" &&
  typeof window.document.createElement !== "undefined";
