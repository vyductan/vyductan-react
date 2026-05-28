import type { XOR } from "ts-xor";
import React from "react";

import {
  EmptyContent,
  EmptyHeader,
  Empty as ShadcnEmpty,
} from "@acme/ui/shadcn/empty";

import type { EmptyProps as EmptyProperties } from "./empty";
import { Empty as InternalEmpty } from "./empty";
import SimpleEmptyImg from "./simple";

const defaultEmptyImg = <InternalEmpty />;
const simpleEmptyImg = <SimpleEmptyImg />;

export interface TransferLocale {
  description: string;
}

type ShadcnEmptyProperties = React.ComponentProps<typeof ShadcnEmpty>;
type ConditionEmptyProperties = XOR<EmptyProperties, ShadcnEmptyProperties>;

const ConditionEmpty = (properties: ConditionEmptyProperties) => {
  const isShadcnSelect = React.Children.toArray(properties.children).some(
    (child) =>
      React.isValidElement(child) &&
      (child.type === EmptyHeader || child.type === EmptyContent),
  );

  if (isShadcnSelect)
    return <ShadcnEmpty {...(properties as ShadcnEmptyProperties)} />;
  return <InternalEmpty {...(properties as EmptyProperties)} />;
};

type CompoundedComponent = typeof ConditionEmpty & {
  PRESENTED_IMAGE_DEFAULT: React.ReactNode;
  PRESENTED_IMAGE_SIMPLE: React.ReactNode;
};
const Empty = ConditionEmpty as CompoundedComponent;

Empty.PRESENTED_IMAGE_DEFAULT = defaultEmptyImg;
Empty.PRESENTED_IMAGE_SIMPLE = simpleEmptyImg;

export { Empty };
export {
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@acme/ui/shadcn/empty";
