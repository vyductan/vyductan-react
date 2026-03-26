"use client";

import * as React from "react";
import type { EditorState } from "lexical";
import { useEffect, useRef } from "react";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { $getRoot } from "lexical";

import { normalizeHtmlOutput } from "./normalize-html-output";

// Plugin to initialize editor with HTML content
function InitialHtmlPlugin({ html }: { html: string }) {
  const [editor] = useLexicalComposerContext();
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (isInitializedRef.current) return;

    // Only initialize if HTML is provided and not empty
    if (html) {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(html, "text/html");
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();

        root.clear();
        root.append(...nodes);
      });
    }

    isInitializedRef.current = true;
  }, [editor, html]);

  return null;
}

interface HtmlPluginsProps {
  defaultValue?: string;
  value?: string;
  onChange?: (htmlString: string, editorState: EditorState) => void;
}

export function HtmlPlugins({
  defaultValue,
  value,
  onChange,
}: HtmlPluginsProps) {
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
