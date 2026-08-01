"use client";

/**
 * Keyboard Shortcuts Help Plugin
 *
 * Hiển thị modal với danh sách keyboard shortcuts khi nhấn Ctrl+/ hoặc Cmd+/
 */
import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { COMMAND_PRIORITY_LOW, KEY_MODIFIER_COMMAND } from "lexical";

import { Modal } from "@acme/ui/components/modal";

interface ShortcutGroup {
  title: string;
  shortcuts: Array<{
    keys: string[];
    description: string;
  }>;
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: "Text Formatting",
    shortcuts: [
      { keys: ["Ctrl", "B"], description: "Bold" },
      { keys: ["Ctrl", "I"], description: "Italic" },
      { keys: ["Ctrl", "U"], description: "Underline" },
      { keys: ["Ctrl", "Shift", "X"], description: "Strikethrough" },
      { keys: ["Ctrl", "K"], description: "Insert Link" },
      { keys: ["Ctrl", "Shift", "C"], description: "Code Block" },
    ],
  },
  {
    title: "Headings",
    shortcuts: [
      { keys: ["Ctrl", "Alt", "1"], description: "Heading 1" },
      { keys: ["Ctrl", "Alt", "2"], description: "Heading 2" },
      { keys: ["Ctrl", "Alt", "3"], description: "Heading 3" },
    ],
  },
  {
    title: "Lists",
    shortcuts: [
      { keys: ["Ctrl", "Shift", "U"], description: "Bulleted List" },
      { keys: ["Ctrl", "Shift", "O"], description: "Numbered List" },
      { keys: ["Tab"], description: "Indent" },
      { keys: ["Shift", "Tab"], description: "Outdent" },
    ],
  },
  {
    title: "Navigation & Editing",
    shortcuts: [
      { keys: ["Ctrl", "F"], description: "Find" },
      { keys: ["Ctrl", "H"], description: "Find & Replace" },
      { keys: ["Ctrl", "Z"], description: "Undo" },
      { keys: ["Ctrl", "Shift", "Z"], description: "Redo" },
      { keys: ["Ctrl", "A"], description: "Select All" },
      { keys: ["Ctrl", "Shift", "F"], description: "Fullscreen" },
    ],
  },
  {
    title: "Commands",
    shortcuts: [
      { keys: ["/"], description: "Open Command Menu" },
      { keys: ["Ctrl", "/"], description: "Show Keyboard Shortcuts" },
    ],
  },
];

function ShortcutKey({ keyText }: { keyText: string }) {
  return (
    <kbd className="border-border bg-muted/50 text-foreground inline-flex h-5 min-w-[20px] items-center justify-center rounded border px-1.5 text-xs font-medium shadow-sm">
      {keyText}
    </kbd>
  );
}

export function KeyboardShortcutsHelpPlugin(): ReactElement | null {
  const [editor] = useLexicalComposerContext();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        KEY_MODIFIER_COMMAND,
        (payload) => {
          const event = payload;
          if (
            (event.metaKey || event.ctrlKey) &&
            event.key === "/" &&
            !event.shiftKey
          ) {
            event.preventDefault();
            setIsOpen(true);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor]);

  const isMac =
    globalThis.window !== undefined &&
    navigator.platform.toUpperCase().includes("MAC");

  const formatKeys = (keys: string[]): string[] => {
    return keys.map((key) => {
      if (key === "Ctrl" && isMac) return "⌘";
      if (key === "Ctrl") return "Ctrl";
      if (key === "Alt" && isMac) return "⌥";
      if (key === "Alt") return "Alt";
      if (key === "Shift" && isMac) return "⇧";
      if (key === "Shift") return "Shift";
      return key;
    });
  };

  return (
    <>
      <Modal
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Keyboard Shortcuts"
        width={600}
        footer={null}
      >
        <div className="space-y-6 py-4">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="text-foreground mb-3 text-sm font-semibold">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="hover:bg-accent flex items-center justify-between rounded-md px-3 py-2"
                  >
                    <span className="text-foreground text-sm">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {formatKeys(shortcut.keys).map((key, keyIndex) => (
                        <span
                          key={keyIndex}
                          className="inline-flex items-center"
                        >
                          {isMac &&
                          (key === "⌘" || key === "⌥" || key === "⇧") ? (
                            <kbd className="border-border bg-muted/50 text-foreground inline-flex h-6 min-w-[24px] items-center justify-center rounded border px-2 text-xs font-medium shadow-sm">
                              {key}
                            </kbd>
                          ) : (
                            <ShortcutKey keyText={key} />
                          )}
                          {keyIndex < formatKeys(shortcut.keys).length - 1 && (
                            <span className="text-muted-foreground mx-1">
                              +
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="border-border border-t pt-4">
            <p className="text-muted-foreground text-xs">
              Tip: Press{" "}
              {isMac ? (
                <>
                  <kbd className="border-border bg-muted/50 mx-1 rounded border px-1.5 py-0.5 text-xs">
                    ⌘
                  </kbd>{" "}
                </>
              ) : (
                <>
                  <kbd className="border-border bg-muted/50 mx-1 rounded border px-1.5 py-0.5 text-xs">
                    Ctrl
                  </kbd>{" "}
                  +
                </>
              )}{" "}
              <kbd className="border-border bg-muted/50 mx-1 rounded border px-1.5 py-0.5 text-xs">
                /
              </kbd>{" "}
              to open this menu anytime
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
