import type { XOR } from "ts-xor";
import React from "react";

import type { ModalProps } from "./modal";
import { Dialog, DialogContent } from "./_components";
import { Modal as InternalModal } from "./modal";

export * from "./modal";

export * from "./_components";
export * from "./use-modal";

type ShadcnModalProps = React.ComponentProps<typeof Dialog>;
type XORModalProps = XOR<ModalProps, ShadcnModalProps>;
const Modal = (props: XORModalProps) => {
  const isShadcnDialog = React.Children.toArray(props.children).some(
    (child) => React.isValidElement(child) && child.type === DialogContent,
  );
  if (isShadcnDialog) {
    return <Dialog {...props}>{props.children}</Dialog>;
  }
  return (
    <InternalModal {...(props as ModalProps)}>{props.children}</InternalModal>
  );
};

export { Modal };
