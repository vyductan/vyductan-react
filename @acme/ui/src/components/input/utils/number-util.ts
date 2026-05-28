import { num2str, trimNumber } from "@rc-component/mini-decimal";

export function getDecupleSteps(step: string | number) {
  const stepString =
    typeof step === "number" ? num2str(step) : trimNumber(step).fullStr;
  const hasPoint = stepString.includes(".");
  if (!hasPoint) {
    return step + "0";
  }
  return trimNumber(stepString.replaceAll(/(\d)\.(\d)/g, "$1$2.")).fullStr;
}
