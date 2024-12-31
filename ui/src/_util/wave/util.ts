/* eslint-disable unicorn/no-null */
export function isNotGrey(color: string) {
  const match = /rgba?\((\d*), (\d*), (\d*)(, [\d.]*)?\)/.exec(color || "");
  if (match?.[1] && match[2] && match[3]) {
    return !(match[1] === match[2] && match[2] === match[3]);
  }
  return true;
}

export function isValidWaveColor(color: string) {
  return (
    color &&
    color !== "#fff" &&
    color !== "#ffffff" &&
    color !== "rgb(255, 255, 255)" &&
    color !== "rgba(255, 255, 255, 1)" &&
    // isNotGrey(color) && // disable this line to allow show wave on grey color
    !/rgba\((?:\d*, ){3}0\)/.test(color) && // any transparent rgba color
    color !== "transparent"
  );
}

export function getTargetWaveColor(node: HTMLElement) {
  const { borderTopColor, borderColor, backgroundColor } =
    getComputedStyle(node);
  if (isValidWaveColor(borderTopColor)) {
    return borderTopColor;
  }
  if (isValidWaveColor(borderColor)) {
    return borderColor;
  }
  if (isValidWaveColor(backgroundColor)) {
    return backgroundColor;
  }
  return null;
}
