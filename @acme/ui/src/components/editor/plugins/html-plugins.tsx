"use client";

import type { EditorState } from "lexical";
import { useEffect, useRef } from "react";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { $getRoot, $insertNodes } from "lexical";

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

        $getRoot().select();
        $insertNodes(nodes);
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
            onChange?.(htmlString, editorState);
          });
        }}
      />
    </>
  );
}

// Default export for dynamic imports
export default HtmlPlugins;
