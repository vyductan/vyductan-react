import type { HistoryState } from "@lexical/react/LexicalHistoryPlugin";
import { createEmptyHistoryState } from "@lexical/react/LexicalHistoryPlugin";
import { create } from "zustand";

type EditorHistoryState = {
  historyState?: HistoryState;
};
export const useEditorHistory = create<EditorHistoryState>(() => ({
  historyState: createEmptyHistoryState(),
}));
