import type { XOR } from "ts-xor";

import { Alert as ShadcnAlert } from "@acme/ui/shadcn/alert";

import type { ShadcnAlertProps as ShadcnAlertProperties } from "./_components";
import type { AlertProps as OwnAlertProperties } from "./alert";
import { Alert as OwnAlert } from "./alert";

export * from "./_components";

type ConditionAlertProperties = XOR<OwnAlertProperties, ShadcnAlertProperties>;
const Alert = (properties: ConditionAlertProperties) => {
  if ("type" in properties) {
    return <OwnAlert {...properties} />;
  }
  return <ShadcnAlert {...properties} />;
};

export { Alert };
