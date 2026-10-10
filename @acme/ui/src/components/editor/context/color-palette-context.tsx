import { createContext, useContext } from "react";

import type { EditorColorPalette } from "../plugins/toolbar/editor-color-palette";

/** The colors the editor's toolbars offer. See EditorColorPalette. */
export const EditorColorPaletteContext =
  createContext<EditorColorPalette>("free");

export const useEditorColorPalette = () =>
  useContext(EditorColorPaletteContext);
