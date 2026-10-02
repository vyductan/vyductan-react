import type { LexicalNode } from "lexical";
import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $dfs, mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_CRITICAL,
  KEY_DOWN_COMMAND,
  PASTE_COMMAND,
  SELECTION_INSERT_CLIPBOARD_NODES_COMMAND,
} from "lexical";

import { $insertPlainText } from "./plain-text-linebreak-paste-plugin";

/** Reads the clipboard's plain text, for a paste without formatting. */
export type ReadClipboardText = () => Promise<string>;

const readClipboardTextFromBrowser: ReadClipboardText = () =>
  navigator.clipboard.readText();

/**
 * What a paste brings in from elsewhere: what it means, not how it looked.
 *
 * - Pasted HTML keeps its formatting (bold, code, links, lists, headings,
 *   tables) but not its colors, backgrounds and fonts. A web page's grey on
 *   white came along as a white box on the dark editor, and in markdown it
 *   could not even be saved — shown, then gone on reopening. The editor's
 *   own copy keeps its text colors: those are the toolbar's, chosen here.
 * - A copy from a VS Code text editor is source: its HTML is the syntax
 *   highlighting. It goes in as its plain text — read as markdown only when
 *   it was copied from a markdown file.
 * - Cmd+Shift+V pastes without formatting, as in Notion: the clipboard's
 *   plain text as it is. In VS Code the shortcut is "Open Markdown Preview",
 *   so the editor keeps the keystroke to itself; and its webview cannot read
 *   the clipboard, so the host does (`readClipboardText`).
 */
export function PasteCleanupPlugin({
  readClipboardText = readClipboardTextFromBrowser,
}: {
  readClipboardText?: ReadClipboardText;
}): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Set while a paste from outside the editor is on its way in: its nodes
    // reach SELECTION_INSERT_CLIPBOARD_NODES_COMMAND in the same update.
    let fromOutside = false;

    const pastePlainText = (text: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) && text.length > 0) {
          $insertPlainText(selection, text);
        }
      });
    };

    return mergeRegister(
      editor.registerCommand(
        PASTE_COMMAND,
        (event) => {
          fromOutside = false;
          if (!("clipboardData" in event) || !event.clipboardData) return false;
          const clipboard = event.clipboardData;

          const vsCode = vsCodeEditorData(clipboard);
          if (vsCode) {
            const text = clipboard.getData("text/plain");
            event.preventDefault();
            if (vsCode.mode === "markdown") {
              // Markdown source: the paste of its text alone, which the
              // markdown paste reads.
              const plain = new DataTransfer();
              plain.setData("text/plain", text);
              editor.dispatchCommand(
                PASTE_COMMAND,
                new ClipboardEvent("paste", { clipboardData: plain }),
              );
            } else {
              pastePlainText(text);
            }
            return true;
          }

          const html = clipboard.getData("text/html");
          // The editor's own copy carries its nodes as JSON. (A block copy
          // is pasted by its own plugin, which inserts it directly.)
          fromOutside =
            html !== "" &&
            !clipboard.types.includes("application/x-lexical-editor");
          // The paste is handled in this update or not at all.
          queueMicrotask(() => {
            fromOutside = false;
          });
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        SELECTION_INSERT_CLIPBOARD_NODES_COMMAND,
        ({ nodes }) => {
          if (fromOutside) {
            fromOutside = false;
            nodes.forEach($dropStyles);
          }
          // Only cleaned: the insert goes on as usual.
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        KEY_DOWN_COMMAND,
        (event) => {
          const isPlainPaste =
            event.code === "KeyV" &&
            event.shiftKey &&
            (event.metaKey || event.ctrlKey) &&
            !event.altKey;
          if (!isPlainPaste) return false;
          event.preventDefault();
          event.stopPropagation();
          readClipboardText().then(pastePlainText, () => {
            // No clipboard access: nothing to paste.
          });
          return true;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [editor, readClipboardText]);

  return null;
}

/** The note VS Code adds to a copy from its text editors, if this is one. */
function vsCodeEditorData(clipboard: DataTransfer): { mode?: string } | null {
  const data = clipboard.getData("vscode-editor-data");
  if (!data) return null;
  try {
    const parsed: unknown = JSON.parse(data);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

/** Inline CSS on `node` and everything in it. */
function $dropStyles(node: LexicalNode) {
  for (const { node: each } of $dfs(node)) {
    if ($isTextNode(each) && each.getStyle() !== "") each.setStyle("");
    if ($isElementNode(each) && each.getStyle() !== "") each.setStyle("");
  }
}
