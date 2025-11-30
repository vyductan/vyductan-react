import type { XOR } from "ts-xor";
import React from "react";

import type { EmptyProps } from "./empty";
import {
  EmptyContent,
  EmptyHeader,
  Empty as ShadcnEmpty,
} from "@acme/ui/shadcn/empty";
import { Empty as InternalEmpty } from "./empty";
import SimpleEmptyImg from "./simple";

const defaultEmptyImg = <InternalEmpty />;
const simpleEmptyImg = <SimpleEmptyImg />;

export interface TransferLocale {
  description: string;
}

type ShadcnEmptyProps = React.ComponentProps<typeof ShadcnEmpty>;
type ConditionEmptyProps = XOR<EmptyProps, ShadcnEmptyProps>;

const ConditionEmpty = (props: ConditionEmptyProps) => {
  const isShadcnSelect = React.Children.toArray(props.children).some(
    (child) =>
      React.isValidElement(child) &&
      (child.type === EmptyHeader || child.type === EmptyContent),
  );

  if (isShadcnSelect) return <ShadcnEmpty {...(props as ShadcnEmptyProps)} />;
  return <InternalEmpty {...(props as EmptyProps)} />;
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
