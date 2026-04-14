/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type { JSX } from "react";
import { useCallback, useMemo, useState } from "react";

import {
  DialogContent,
  DialogHeader,
  Dialog as DialogRoot,
  DialogTitle,
} from "../../modal";

export function useEditorModal(): [
  JSX.Element | undefined,
  (title: string, showModal: (onClose: () => void) => JSX.Element) => void,
] {
  const [modalContent, setModalContent] = useState<
    | {
        closeOnClickOutside: boolean;
        content: JSX.Element;
        title: string;
      }
    | undefined
  >();

  const onClose = useCallback(() => {
    setModalContent(undefined);
  }, []);

  const modal = useMemo(() => {
    if (modalContent === undefined) {
      return;
    }
    const { title, content } = modalContent;
    return (
      <DialogRoot open={true} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </DialogRoot>
    );
  }, [modalContent, onClose]);

  const showModal = useCallback(
    (
      title: string,
      getContent: (onClose: () => void) => JSX.Element,
      closeOnClickOutside = false,
    ) => {
      setModalContent({
        closeOnClickOutside,
        content: getContent(onClose),
        title,
      });
    },
    [onClose],
  );

  return [modal, showModal];
}
