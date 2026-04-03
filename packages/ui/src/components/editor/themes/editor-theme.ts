import type { EditorThemeClasses } from "lexical";

import "./editor-theme.css";
import "./editor-theme.runtime.css";

import { richTextSemanticContract } from "./rich-text-semantic-contract";

export const editorTheme: EditorThemeClasses = {
  ltr: "text-left",
  rtl: "text-right",
  ...richTextSemanticContract,
  hashtag: "text-blue-600 bg-blue-100 rounded-md px-1",
  image: "relative inline-block user-select-none cursor-default editor-image",
  inlineImage:
    "relative inline-block user-select-none cursor-default inline-editor-image",
  keyword: "text-purple-900 font-bold",
  characterLimit: "!bg-destructive/50",
  tableCellActionButton:
    "EditorTheme__tableCellActionButton bg-background block border-0 rounded-2xl w-5 h-5 text-foreground cursor-pointer",
  tableCellActionButtonContainer:
    "EditorTheme__tableCellActionButtonContainer block right-1 top-1.5 absolute z-10 w-5 h-5",
  tableCellEditing: "EditorTheme__tableCellEditing rounded-sm shadow-sm",
  tableCellPrimarySelected:
    "EditorTheme__tableCellPrimarySelected border border-primary border-solid block h-[calc(100%-2px)] w-[calc(100%-2px)] absolute -left-[1px] -top-[1px] z-10 ",
  tableCellResizer:
    "EditorTheme__tableCellResizer absolute -right-1 h-full w-2 cursor-ew-resize z-10 top-0",
  tableCellSelected: "EditorTheme__tableCellSelected bg-muted",
  tableCellSortedIndicator:
    "EditorTheme__tableCellSortedIndicator block opacity-50 absolute bottom-0 left-0 w-full h-1 bg-muted",
  tableResizeRuler:
    "EditorTheme__tableCellResizeRuler block absolute w-[1px] h-full bg-primary top-0",
  tableRowStriping:
    "EditorTheme__tableRowStriping m-0 border-t p-0 even:bg-muted",
  tableSelected: "EditorTheme__tableSelected ring-2 ring-primary ring-offset-2",
  tableSelection: "EditorTheme__tableSelection bg-transparent",
  layoutItem: "border border-dashed px-4 py-2",
  layoutContainer: "grid gap-2.5 my-2.5 mx-0",
  autocomplete: "text-muted-foreground",
  blockCursor: "",
  embedBlock: {
    base: "user-select-none",
    focus: "ring-2 ring-primary ring-offset-2",
  },
  indent: "[--lexical-indent-base-value:40px]",
  mark: "",
  markOverlap: "",
};
