"use client";

import { useCallback, useMemo, useState } from "react";
import * as React from "react";

import { Modal } from "./Modal";

export const useModal = (): [
  JSX.Element | null,
  (options: {
    title: string;
    content: (onCancel: () => void) => React.ReactNode;
    onCancel?: () => void;
  }) => void,
] => {
  const [modalState, setModalState] = useState<null | {
    title: string;
    content: React.ReactNode;
    onCancel?: () => void;
  }>(null);

  const onCancel = useCallback(() => {
    setModalState(null);
  }, []);

  const modal = useMemo(() => {
    if (modalState === null) {
      return null;
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
