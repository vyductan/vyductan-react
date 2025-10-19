import type { XOR } from "ts-xor";

import type { ShadcnAlertProps } from "./_components";
import type { AlertProps as OwnAlertProps } from "./alert";
import { Alert as ShadcnAlert } from "../../shadcn/alert";
import { Alert as OwnAlert } from "./alert";

export * from "./_components";

type ConditionAlertProps = XOR<OwnAlertProps, ShadcnAlertProps>;
const Alert = (props: ConditionAlertProps) => {
  if ("type" in props) {
    return <OwnAlert {...props} />;
  }
  return <ShadcnAlert {...props} />;
};

export { Alert };
