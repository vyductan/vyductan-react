import type { LexicalEditor } from "lexical";
import { useCallback, useEffect, useRef } from "react";
import { $generateHtmlFromNodes } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  COMMAND_PRIORITY_HIGH,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
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
  /**
   * Hands out a setter for the box's content, so a caller can put a draft back
   * in — taking a sent message back for correction, say. The editor takes
   * `value` as an initial state only, so there is no prop that could do this.
   */
  bindSetValue?: (setValue: (text: string) => void) => void;
  disabled?: boolean;
  /**
   * Let an empty text box be sent. Set it when the message carries something
   * other than text — an attached image, say — otherwise a picture-only
   * message can be attached but never sent.
   */
  allowEmpty?: boolean;
  /**
   * Earlier messages, newest first. Arrow Up walks back through them the way a
   * shell history does; empty disables the behaviour entirely.
   */
  history?: string[];
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
  bindSetValue,
  disabled = false,
  allowEmpty = false,
  history = [],
}: ComposerSubmitPluginProperties) {
  const [editor] = useLexicalComposerContext();

  // -1 means "composing something new"; 0 and up index into `history`.
  const historyIndex = useRef(-1);

  const replaceContent = useCallback(
    (text: string) => {
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        const paragraph = $createParagraphNode();
        if (text) paragraph.append($createTextNode(text));
        root.append(paragraph);
        paragraph.selectEnd();
      });
    },
    [editor],
  );

  const submit = useCallback(() => {
    if (disabled) {
      return;
    }

    // Emptiness is decided on the text, not the serialized value: an empty
    // document still serializes to a non-empty json envelope.
    if (!allowEmpty && !readPlainText(editor).trim()) {
      return;
    }

    const value = readValue(editor, format);

    if (!allowEmpty && !value.trim()) {
      return;
    }

    onSubmit(value);
    historyIndex.current = -1;

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
  }, [allowEmpty, disabled, editor, format, onSubmit]);

  useEffect(() => {
    bindSubmit(submit);
  }, [bindSubmit, submit]);

  useEffect(() => {
    bindSetValue?.(replaceContent);
  }, [bindSetValue, replaceContent]);

  useEffect(() => {
    if (history.length === 0) return;

    // Only recall from an empty composer. Arrow Up inside a draft has to keep
    // moving the caret, or multiline editing becomes impossible — which is the
    // same rule a shell follows.
    const unregisterUp = editor.registerCommand(
      KEY_ARROW_UP_COMMAND,
      (event) => {
        if (historyIndex.current === -1 && readPlainText(editor).trim()) {
          return false;
        }
        const next = Math.min(historyIndex.current + 1, history.length - 1);
        const entry = history[next];
        if (entry === undefined) return false;
        event?.preventDefault();
        historyIndex.current = next;
        replaceContent(entry);
        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );

    const unregisterDown = editor.registerCommand(
      KEY_ARROW_DOWN_COMMAND,
      (event) => {
        if (historyIndex.current < 0) return false;
        event?.preventDefault();
        const next = historyIndex.current - 1;
        historyIndex.current = next;
        replaceContent(next < 0 ? "" : (history[next] ?? ""));
        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );

    return () => {
      unregisterUp();
      unregisterDown();
    };
  }, [editor, history, replaceContent]);

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
