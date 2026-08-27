import type { LexicalEditor } from "lexical";
import { useCallback, useEffect } from "react";
import { $generateHtmlFromNodes } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $getRoot,
  COMMAND_PRIORITY_HIGH,
  KEY_ENTER_COMMAND,
} from "lexical";

import { normalizeHtmlOutput } from "../editor/plugins/normalize-html-output";
import { getMarkdownFromEditor } from "../editor/utils/lexical-converter";

export type ComposerFormat = "markdown" | "json" | "html";

/**
 * Reads the value straight out of the live editor rather than from the editor's
 * `onChange`.
 *
 * That indirection mattered: `Editor` loads its markdown and html plugins with
 * `lazy()`, while the rich-text plugin is eager. So the composer accepts typing
 * before those chunks arrive, and an Enter in that window used to submit an empty
 * string and clear the draft — a silently lost message, not just a flaky test.
 */
function readValue(editor: LexicalEditor, format: ComposerFormat): string {
  if (format === "markdown") {
    return getMarkdownFromEditor(editor);
  }

  if (format === "json") {
    return JSON.stringify(editor.getEditorState().toJSON());
  }

  let html = "";
  editor.getEditorState().read(() => {
    html = $generateHtmlFromNodes(editor, null);
  });

  return normalizeHtmlOutput(html);
}

function readPlainText(editor: LexicalEditor): string {
  let text = "";
  editor.getEditorState().read(() => {
    text = $getRoot().getTextContent();
  });

  return text;
}

type ComposerSubmitPluginProperties = {
  format: ComposerFormat;
  onSubmit: (value: string) => void;
  /**
   * Hands the send routine back out, so the button and the Enter key run the
   * identical path rather than two implementations that drift.
   */
  bindSubmit: (submit: () => void) => void;
  disabled?: boolean;
};

/**
 * Lives inside the Lexical composer through `Editor`'s children slot — the only
 * place a plugin can reach the editor instance, which is needed to intercept
 * Enter, read the value, and clear afterwards.
 *
 * Clearing happens here rather than by resetting a `value` prop: the editor takes
 * `value` as an initial state only, so assigning it again would empty nothing.
 */
export function ComposerSubmitPlugin({
  format,
  onSubmit,
  bindSubmit,
  disabled = false,
}: ComposerSubmitPluginProperties) {
  const [editor] = useLexicalComposerContext();

  const submit = useCallback(() => {
    if (disabled) {
      return;
    }

    // Emptiness is decided on the text, not the serialized value: an empty
    // document still serializes to a non-empty json envelope.
    if (!readPlainText(editor).trim()) {
      return;
    }

    const value = readValue(editor, format);

    if (!value.trim()) {
      return;
    }

    onSubmit(value);

    editor.update(() => {
      const root = $getRoot();
      root.clear();

      // clear() on its own leaves a root with no children, so the selection
      // stays anchored on the root — a state every plugin that walks from the
      // selection to its top-level element throws on, and one no caret can sit
      // in. Hand back an empty paragraph instead.
      const paragraph = $createParagraphNode();
      root.append(paragraph);
      paragraph.select();
    });
    editor.focus();
  }, [disabled, editor, format, onSubmit]);

  useEffect(() => {
    bindSubmit(submit);
  }, [bindSubmit, submit]);

  useEffect(() => {
    return editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event) => {
        // Shift+Enter is the multiline path, and also how a list gets its second
        // item. Plain Enter sends, including from inside a list or code block: in
        // a chat composer the send button should never be the only way out.
        if (event?.shiftKey) {
          return false;
        }

        event?.preventDefault();
        submit();

        // Claiming the command stops Lexical inserting a paragraph break that
        // would survive into the next message.
        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor, submit]);

  return null;
}
