import type { LexicalEditor } from "lexical";
import type { JSX } from "react";
import { createContext, useContext, useRef } from "react";

const Context = createContext<{
  activeEditor: LexicalEditor;
  $updateToolbar: () => void;
  blockType: string;
  setBlockType: (blockType: string) => void;
  showModal: (
    title: string,
    showModal: (onClose: () => void) => JSX.Element,
  ) => void;
  formatHandledRef: React.MutableRefObject<boolean>;
}>({
  activeEditor: {} as LexicalEditor,
  $updateToolbar: () => {
    //
  },
  blockType: "paragraph",
  setBlockType: () => {
    //
  },
  showModal: () => {
    //
  },
  formatHandledRef: { current: false },
});

export function ToolbarContext({
  activeEditor,
  $updateToolbar,
  blockType,
  setBlockType,
  showModal,
  children,
}: {
  activeEditor: LexicalEditor;
  $updateToolbar: () => void;
  blockType: string;
  setBlockType: (blockType: string) => void;
  showModal: (
    title: string,
    showModal: (onClose: () => void) => JSX.Element,
  ) => void;
  children: React.ReactNode;
}) {
  const formatHandledRef = useRef(false);
  
  return (
    <Context.Provider
      value={{
        activeEditor,
        $updateToolbar,
        blockType,
        setBlockType,
        showModal,
        formatHandledRef,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useToolbarContext() {
  return useContext(Context);
}
