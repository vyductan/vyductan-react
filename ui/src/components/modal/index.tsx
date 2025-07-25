import type { XOR } from "ts-xor";
import React from "react";

import type { ButtonProps } from "../button";
import type { ModalProps } from "./modal";
import { Dialog, DialogContent } from "./_components";
import { Modal as InternalModal } from "./modal";

export * from "./modal";

export * from "./_components";
export * from "./use-modal";

type ShadcnModalProps = React.ComponentProps<typeof Dialog>;
type XORModalProps = XOR<ModalProps, ShadcnModalProps>;

// Confirm modal configuration interface (for reference)
export interface ConfirmConfig {
  title?: React.ReactNode;
  content?: React.ReactNode;
  onOk?: () => void | Promise<void>;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  okType?: "default" | "primary" | "danger";
  okButtonProps?: ButtonProps;
  confirmLoading?: boolean;
}

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

// Confirm function following Ant Design API
// Note: This is a static method that requires App component to be used
Modal.confirm = (_config: ConfirmConfig) => {
  throw new Error(
    "Modal.confirm() can only be used within App component. " +
      "Please wrap your app with <App> component and use useModal() hook instead.\n\n" +
      "Example:\n" +
      'import { App, useModal } from "@acme/ui";\n\n' +
      "// Wrap your app\n" +
      "<App>\n" +
      "  <YourApp />\n" +
      "</App>\n\n" +
      "// In your component\n" +
      "const modal = useModal();\n" +
      "modal.confirm({ ... });",
  );
};

export { Modal };
