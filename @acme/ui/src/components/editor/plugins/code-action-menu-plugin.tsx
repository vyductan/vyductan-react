/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
// import './index.css';
import type { JSX } from "react";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import {
  $isCodeNode,
  CODE_LANGUAGE_FRIENDLY_NAME_MAP,
  CodeNode,
  getLanguageFriendlyName,
} from "@lexical/code";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useDebounceFn } from "ahooks";
import { $getNearestNodeFromDOMNode } from "lexical";
import { Check, ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../command";
import { Popover, PopoverContent, PopoverTrigger } from "../../popover";
import { CopyButton } from "../editor-ui/code-button";
import { richTextSemanticContract } from "../themes/rich-text-semantic-contract";

/**
 * The class the theme actually gives a code block. This used to look for
 * `code.EditorTheme__code`, the playground's name, which this theme renamed —
 * so the hover matched nothing and the menu never appeared. Reading it off the
 * contract keeps the two from drifting apart again.
 */
const CODE_BLOCK_SELECTOR = `code.${String(richTextSemanticContract.code)}`;

const LANGUAGE_OPTIONS = Object.entries(
  CODE_LANGUAGE_FRIENDLY_NAME_MAP as Record<string, string>,
).map(([value, label]) => ({ value, label }));

const CODE_PADDING = 8;

interface Position {
  top: string;
  right: string;
}

function CodeActionMenuContainer({
  anchorElem,
}: {
  anchorElem: HTMLElement;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  // Read-only content still gets Copy; changing the language is an edit.
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  useEffect(() => editor.registerEditableListener(setIsEditable), [editor]);

  const [lang, setLang] = useState("");
  const [isShown, setShown] = useState<boolean>(false);
  const [shouldListenMouseMove, setShouldListenMouseMove] =
    useState<boolean>(false);
  const [position, setPosition] = useState<Position>({
    right: "0",
    top: "0",
  });
  const codeSetReference = useRef<Set<string>>(new Set());
  const codeDOMNodeReference = useRef<HTMLElement | null>(null);

  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const isSelectOpenReference = useRef(isSelectOpen);
  useEffect(() => {
    isSelectOpenReference.current = isSelectOpen;
  }, [isSelectOpen]);

  function getCodeDOMNode(): HTMLElement | null {
    return codeDOMNodeReference.current;
  }

  const { run: debouncedOnMouseMove } = useDebounceFn(
    (event: MouseEvent | undefined) => {
      const { codeDOMNode, isOutside } = getMouseInfo(event);
      if (isOutside && !isSelectOpenReference.current) {
        setShown(false);
        return;
      }

      if (!codeDOMNode) {
        return;
      }

      codeDOMNodeReference.current = codeDOMNode;

      let codeNode: CodeNode | null = null;
      let _lang = "";

      // A read, not an update: hovering must not add history entries or run
      // transforms. editor.read (not editorState.read) because mapping a DOM
      // node back to its Lexical node needs the active editor.
      editor.read(() => {
        const maybeCodeNode = $getNearestNodeFromDOMNode(codeDOMNode);

        if ($isCodeNode(maybeCodeNode)) {
          codeNode = maybeCodeNode;
          _lang = codeNode.getLanguage() ?? "";
        }
      });

      const { y: editorElementY, right: editorElementRight } =
        anchorElem.getBoundingClientRect();
      const { y, right } = codeDOMNode.getBoundingClientRect();
      setLang(_lang);
      setShown(true);
      setPosition({
        right: `${editorElementRight - right + CODE_PADDING}px`,
        top: `${y - editorElementY}px`,
      });
    },
    {
      wait: 50,
      maxWait: 1000,
    },
  );

  useEffect(() => {
    if (!shouldListenMouseMove) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      debouncedOnMouseMove(event);
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      setShown(false);
      // debouncedOnMouseMove.cancel();
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [shouldListenMouseMove, debouncedOnMouseMove]);

  useEffect(() => {
    return editor.registerMutationListener(
      CodeNode,
      (mutations) => {
        editor.getEditorState().read(() => {
          for (const [key, type] of mutations) {
            switch (type) {
              case "created": {
                codeSetReference.current.add(key);
                break;
              }

              case "destroyed": {
                codeSetReference.current.delete(key);
                break;
              }

              default: {
                break;
              }
            }
          }
        });
        setShouldListenMouseMove(codeSetReference.current.size > 0);
      },
      { skipInitialization: false },
    );
  }, [editor]);

  const codeFriendlyName = getLanguageFriendlyName(lang);

  return (
    <>
      {isShown ? (
        <div
          className="code-action-menu-container user-select-none text-foreground/50 absolute flex h-9 flex-row items-center space-x-1 text-xs"
          style={{ ...position }}
        >
          {!isEditable && (
            <span className="px-1.5 py-0.5">
              {codeFriendlyName ?? "Plain Text"}
            </span>
          )}
          {isEditable && (
            <Popover open={isSelectOpen} onOpenChange={setIsSelectOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="hover:bg-muted/50 flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors"
                  title="Select language"
                >
                  {codeFriendlyName ?? "Plain Text"}
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0" align="end">
                <Command>
                  <CommandInput placeholder="Search for a language..." />
                  <CommandList>
                    <CommandEmpty>No language found.</CommandEmpty>
                    <CommandGroup>
                      {LANGUAGE_OPTIONS.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.label}
                          onSelect={() => {
                            editor.update(() => {
                              const codeDOMNode = getCodeDOMNode();
                              if (!codeDOMNode) return;
                              const maybeCodeNode =
                                $getNearestNodeFromDOMNode(codeDOMNode);
                              if ($isCodeNode(maybeCodeNode)) {
                                maybeCodeNode.setLanguage(option.value);
                              }
                            });
                            setIsSelectOpen(false);
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              lang === option.value
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
          <CopyButton editor={editor} getCodeDOMNode={getCodeDOMNode} />
        </div>
      ) : null}
    </>
  );
}

function getMouseInfo(event: MouseEvent | undefined): {
  codeDOMNode: HTMLElement | null;
  isOutside: boolean;
} {
  // Safety check for undefined event
  if (!event) {
    return { codeDOMNode: null, isOutside: true };
  }

  const target = event.target;

  // Any element, not only HTMLElement: the copy button's icon is an SVG, and
  // reaching for the button put the pointer on it — which read as "outside"
  // and hid the menu before Copy could be clicked.
  if (target instanceof Element) {
    const codeDOMNode = target.closest<HTMLElement>(CODE_BLOCK_SELECTOR);
    const isOutside = !(
      codeDOMNode ??
      target.closest<HTMLElement>("div.code-action-menu-container") ??
      target.closest<HTMLElement>("[data-radix-popper-content-wrapper]") ??
      target.closest<HTMLElement>("[cmdk-root]")
    );

    return { codeDOMNode, isOutside };
  } else {
    return { codeDOMNode: null, isOutside: true };
  }
}

export function CodeActionMenuPlugin({
  anchorElem,
}: {
  anchorElem: HTMLDivElement | null;
}): React.ReactPortal | null {
  if (!anchorElem) {
    return null;
  }

  return createPortal(
    <CodeActionMenuContainer anchorElem={anchorElem} />,
    anchorElem,
  );
}
