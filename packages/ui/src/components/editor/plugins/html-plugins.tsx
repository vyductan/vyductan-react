/* eslint-disable unicorn/no-null -- Lexical APIs and serialized editor fixtures intentionally use null semantics. */
"use client";

import type { EditorState } from "lexical";
import { useEffect, useRef } from "react";
import { $generateHtmlFromNodes } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";

import {
  createBrowserHtmlDocument,
  importDomIntoEditor,
} from "../utils/html-converter";
import { normalizeHtmlOutput } from "./normalize-html-output";

// Plugin to initialize editor with HTML content
function InitialHtmlPlugin({ html }: { html: string }) {
  const [editor] = useLexicalComposerContext();
  const isInitializedReference = useRef(false);

  useEffect(() => {
    if (isInitializedReference.current) return;

    // Only initialize if HTML is provided and not empty
    if (html) {
      editor.update(() => {
        importDomIntoEditor(editor, createBrowserHtmlDocument(html));
      });
    }

    isInitializedReference.current = true;
  }, [editor, html]);

  return null;
}

interface HtmlPluginsProperties {
  defaultValue?: string;
  value?: string;
  onChange?: (htmlString: string, editorState: EditorState) => void;
}

export function HtmlPlugins({
  defaultValue,
  value,
  onChange,
}: HtmlPluginsProperties) {
  return (
    <>
      <InitialHtmlPlugin html={defaultValue ?? value ?? ""} />

      <OnChangePlugin
        ignoreSelectionChange={true}
        onChange={(editorState, editor) => {
          editorState.read(() => {
            const htmlString = $generateHtmlFromNodes(editor, null);
            onChange?.(normalizeHtmlOutput(htmlString), editorState);
          });
        }}
      />
    </>
  );
}

// Default export for dynamic imports
export default HtmlPlugins;
