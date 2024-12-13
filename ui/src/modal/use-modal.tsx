"use client";

import { useCallback, useMemo, useState } from "react";
import * as React from "react";

import { Modal } from "./modal";

export const useModal = (): [
  React.JSX.Element | undefined,
  (options: {
    title: string;
    content: (onCancel: () => void) => React.ReactNode;
    onCancel?: () => void;
  }) => void,
] => {
  const [modalState, setModalState] = useState<{
    title: string;
    content: React.ReactNode;
    onCancel?: () => void;
  }>();

  const onCancel = useCallback(() => {
    setModalState(undefined);
  }, []);

  const modal = useMemo(() => {
    if (modalState === undefined) {
      return;
    }
    const { title, content, onCancel } = modalState;
    return (
      <Modal
        open={!!modalState}
        title={title}
        onCancel={onCancel}
        className="max-w-screen-md"
        // closeOnClickOutside={closeOnClickOutside}>
      >
        {content}
      </Modal>
    );
  }, [modalState]);

  const showModal = useCallback(
    (
      options: {
        title: string;
        content: (onCancel: () => void) => React.ReactNode;
        onCancel?: () => void;
      },

      // getContent: (onClose: () => void) => JSX.Element,
      // closeOnClickOutside = false,
    ) => {
      setModalState({
        ...options,
        content: options.content(onCancel),
        onCancel: () => {
          options.onCancel?.();
          onCancel();
        },
      });
    },
    [onCancel],
  );

  return [modal, showModal];
};
