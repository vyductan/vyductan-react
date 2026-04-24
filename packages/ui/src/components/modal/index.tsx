import type { XOR } from "ts-xor";
import React from "react";

import type { ButtonProps as ButtonProperties } from "../button";
import type { ModalProps as ModalProperties } from "./modal";
import { Dialog, DialogContent } from "./_components";
import { Modal as InternalModal } from "./modal";

export * from "./modal";

export * from "./_components";
export * from "./use-modal";

type ShadcnModalProperties = React.ComponentProps<typeof Dialog>;
type XORModalProperties = XOR<ModalProperties, ShadcnModalProperties>;

// Confirm modal configuration interface (for reference)
export interface ConfirmConfig {
  title?: React.ReactNode;
  content?: React.ReactNode;
  onOk?: () => void | Promise<void>;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  okType?: "default" | "primary" | "danger";
  okButtonProps?: ButtonProperties;
  confirmLoading?: boolean;
  /** Internal: used to customize global modal footer, e.g. hide Cancel for warning */
  type?: "confirm" | "warning" | "info" | "success" | "error";
}

const Modal = (properties: XORModalProperties) => {
  const isShadcnDialog = React.Children.toArray(properties.children).some(
    (child) => React.isValidElement(child) && child.type === DialogContent,
  );
  if (isShadcnDialog) {
    return <Dialog {...properties}>{properties.children}</Dialog>;
  }
  return (
    <InternalModal {...(properties as ModalProperties)}>
      {properties.children}
    </InternalModal>
  );
};

// Confirm function following Ant Design API
// Note: This is a static method that requires App component to be used
Modal.confirm = (_config: ConfirmConfig) => {
  throw new Error(
    "Modal.confirm() is not available directly. " +
      "Wrap your app with <App> and use App.useApp().modal.confirm() instead.\n\n" +
      "Example:\n" +
      'import { App } from "@acme/ui";\n\n' +
      "// Wrap your app\n" +
      "<App>\n" +
      "  <YourApp />\n" +
      "</App>\n\n" +
      "// In your component\n" +
      "const { modal } = App.useApp();\n" +
      "modal.confirm({ ... });",
  );
};

// Warning function following Ant Design API
// Note: This is a static method that requires App component to be used
Modal.warning = (_config: ConfirmConfig) => {
  throw new Error(
    "Modal.warning() is not available directly. " +
      "Wrap your app with <App> and use App.useApp().modal.warning() instead.\n\n" +
      "Example:\n" +
      'import { App } from "@acme/ui";\n\n' +
      "// In your component\n" +
      "const { modal } = App.useApp();\n" +
      "modal.warning({ title: 'Warning', content: 'This is a warning.' });",
  );
};

export { Modal };
