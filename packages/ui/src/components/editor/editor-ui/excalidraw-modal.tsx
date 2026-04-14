/* eslint-disable unicorn/no-null -- Lexical APIs and serialized editor fixtures intentionally use null semantics. */
/* eslint-disable react-hooks/static-components */
"use client";

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types";
import type { JSX, ReactElement } from "react";
import * as React from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { DialogTrigger } from "@radix-ui/react-dialog";

import { Button } from "@acme/ui/components/button";
import {
  DialogClose,
  DialogContent,
  Dialog as DialogRoot,
} from "@acme/ui/components/modal";

import { Excalidraw } from "./excalidraw";

export type ExcalidrawInitialElements = ExcalidrawInitialDataState["elements"];

type Properties = {
  closeOnClickOutside?: boolean;
  /**
   * The initial set of elements to draw into the scene
   */
  initialElements: ExcalidrawInitialElements;
  /**
   * The initial set of elements to draw into the scene
   */
  initialAppState: AppState;
  /**
   * The initial set of elements to draw into the scene
   */
  initialFiles: BinaryFiles;
  /**
   * Controls the visibility of the modal
   */
  isShown?: boolean;
  /**
   * Callback when closing and discarding the new changes
   */
  onClose: () => void;
  /**
   * Completely remove Excalidraw component
   */
  onDelete: () => void;
  /**
   * Callback when the save button is clicked
   */
  onSave: (
    elements: ExcalidrawInitialElements,
    appState: Partial<AppState>,
    files: BinaryFiles,
  ) => void;
};

export const useCallbackRefState = () => {
  const [referenceValue, setReferenceValue] =
    React.useState<ExcalidrawImperativeAPI | null>(null);
  const referenceCallback = React.useCallback(
    (value: ExcalidrawImperativeAPI | null) => setReferenceValue(value),
    [],
  );
  return [referenceValue, referenceCallback] as const;
};

/**
 * @explorer-desc
 * A component which renders a modal with Excalidraw (a painting app)
 * which can be used to export an editable image
 */
export function ExcalidrawModal({
  closeOnClickOutside = false,
  onSave,
  initialElements,
  initialAppState,
  initialFiles,
  isShown = false,
  onDelete,
  onClose,
}: Properties): ReactElement | null {
  const excaliDrawModelReference = useRef<HTMLDivElement | null>(null);
  const [excalidrawAPI, excalidrawAPIReferenceCallback] = useCallbackRefState();
  const [discardModalOpen, setDiscardModalOpen] = useState(false);
  const [elements, setElements] =
    useState<ExcalidrawInitialElements>(initialElements);
  const [files, setFiles] = useState<BinaryFiles>(initialFiles);

  useEffect(() => {
    if (excaliDrawModelReference.current !== null) {
      excaliDrawModelReference.current.focus();
    }
  }, []);

  useEffect(() => {
    let modalOverlayElement: HTMLElement | null = null;

    const clickOutsideHandler = (event: MouseEvent) => {
      const target = event.target;
      if (
        excaliDrawModelReference.current !== null &&
        !excaliDrawModelReference.current.contains(target as Node) &&
        closeOnClickOutside
      ) {
        onDelete();
      }
    };

    if (excaliDrawModelReference.current !== null) {
      modalOverlayElement = excaliDrawModelReference.current.parentElement;
      if (modalOverlayElement !== null) {
        modalOverlayElement.addEventListener("click", clickOutsideHandler);
      }
    }

    return () => {
      if (modalOverlayElement !== null) {
        modalOverlayElement.removeEventListener("click", clickOutsideHandler);
      }
    };
  }, [closeOnClickOutside, onDelete]);

  useLayoutEffect(() => {
    const currentModalReference = excaliDrawModelReference.current;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onDelete();
      }
    };

    if (currentModalReference !== null) {
      currentModalReference.addEventListener("keydown", onKeyDown);
    }

    return () => {
      if (currentModalReference !== null) {
        currentModalReference.removeEventListener("keydown", onKeyDown);
      }
    };
  }, [elements, files, onDelete]);

  const save = () => {
    if (elements?.some((element) => !element.isDeleted)) {
      const appState = excalidrawAPI?.getAppState();
      // We only need a subset of the state
      const partialState: Partial<AppState> = {
        exportBackground: appState?.exportBackground,
        exportScale: appState?.exportScale,
        exportWithDarkMode: appState?.theme === "dark",
        isBindingEnabled: appState?.isBindingEnabled,
        isLoading: appState?.isLoading,
        name: appState?.name,
        theme: appState?.theme,
        viewBackgroundColor: appState?.viewBackgroundColor,
        viewModeEnabled: appState?.viewModeEnabled,
        zenModeEnabled: appState?.zenModeEnabled,
        zoom: appState?.zoom,
      };
      onSave(elements, partialState, files);
    } else {
      // delete node if the scene is clear
      onDelete();
    }
  };

  // const discard = () => {
  //   setDiscardModalOpen(true);
  // };

  function ShowDiscardDialog(): JSX.Element {
    return (
      <DialogRoot open={discardModalOpen} onOpenChange={setDiscardModalOpen}>
        <DialogContent>
          Are you sure you want to discard the changes?
        </DialogContent>
        <DialogClose asChild>
          <Button
            onClick={() => {
              setDiscardModalOpen(false);
              onClose();
            }}
          >
            Discard
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button onClick={() => setDiscardModalOpen(false)}>Cancel</Button>
        </DialogClose>
      </DialogRoot>
    );
  }

  if (isShown === false) {
    return null;
  }

  const onChange = (
    els: ExcalidrawInitialElements,
    _: AppState,
    fls: BinaryFiles,
  ) => {
    setElements(els);
    setFiles(fls);
  };

  return (
    <DialogRoot open={isShown}>
      <DialogTrigger />
      <DialogContent className="h-4/6 max-w-4xl overflow-hidden p-0">
        <div className="relative" role="dialog">
          <div className="h-full w-full" ref={excaliDrawModelReference} tabIndex={-1}>
            <div className="h-full w-full">
              {discardModalOpen && <ShowDiscardDialog />}
              <Excalidraw
                onChange={onChange}
                excalidrawAPI={excalidrawAPIReferenceCallback}
                initialData={{
                  appState: initialAppState || { isLoading: false },
                  elements: initialElements,
                  files: initialFiles,
                }}
              />
              <div className="flex h-full items-center justify-center">
                Loading...
              </div>
              <div className="absolute right-1/2 bottom-0 z-10 flex translate-x-1/2 gap-2">
                <Button variant="outline" onClick={onClose}>
                  Discard
                </Button>
                <Button onClick={save}>Save</Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </DialogRoot>
  );
}
