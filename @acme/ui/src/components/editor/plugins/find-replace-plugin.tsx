"use client";

/**
 * Find and replace, as a bar pinned to the top right of the editor.
 *
 * It used to be a modal dialog in the middle of the screen, which covered the
 * very text being searched and blocked the page behind it. Notion's version
 * is the model: a small bar that stays out of the way while you read.
 *
 * - Cmd/Ctrl+F opens it (pre-filled from a selection); Cmd/Ctrl+H opens it
 *   with replace showing.
 * - Enter / Shift+Enter step through matches, Escape closes it and puts the
 *   caret on the current match.
 * - Every match is highlighted, the current one more strongly, with the CSS
 *   Custom Highlight API — nothing is written into the document.
 */
import type { JSX } from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  KEY_MODIFIER_COMMAND,
} from "lexical";
import { ArrowDown, ArrowUp, Replace, X } from "lucide-react";
import { createPortal } from "react-dom";

import { Button } from "@acme/ui/components/button";
import { cn } from "@acme/ui/lib/utils";

interface FindReplacePluginProperties {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface Match {
  key: string;
  offset: number;
}

/** Names the stylesheet styles with `::highlight(...)`. */
const ALL_MATCHES_HIGHLIGHT = "editor-find";
const CURRENT_MATCH_HIGHLIGHT = "editor-find-current";

/** Gap between the bar and the edges it is pinned to, in px. */
const EDGE_GAP = 8;

/** Every case-insensitive occurrence of `query`, in document order. */
function $findMatches(query: string): Match[] {
  if (query === "") return [];
  const needle = query.toLocaleLowerCase();
  const found: Match[] = [];

  const visit = (node: ReturnType<typeof $getRoot>) => {
    for (const child of node.getChildren()) {
      if ($isTextNode(child)) {
        const haystack = child.getTextContent().toLocaleLowerCase();
        let index = haystack.indexOf(needle);
        while (index !== -1) {
          found.push({ key: child.getKey(), offset: index });
          index = haystack.indexOf(needle, index + needle.length);
        }
      } else if ($isElementNode(child)) {
        visit(child as unknown as ReturnType<typeof $getRoot>);
      }
    }
  };

  visit($getRoot());
  return found;
}

/** The nearest ancestor that scrolls, so the bar never slides under what sits above it. */
function scrollParentOf(element: HTMLElement): HTMLElement | null {
  let current = element.parentElement;
  while (current) {
    const { overflowY } = getComputedStyle(current);
    if (/(auto|scroll|overlay)/.test(overflowY)) return current;
    current = current.parentElement;
  }
  return null;
}

/**
 * The DOM text a Lexical text node renders into. Formatted text is wrapped —
 * inline code as <code><span>, bold as <strong> — so it is not always the
 * element's first child; those matches were counted and never painted.
 */
function firstTextNode(element: HTMLElement): Text | null {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  return walker.nextNode() as Text | null;
}

/**
 * Where the bar can start without sitting under something pinned over the
 * page — a sticky or fixed header the editor knows nothing about.
 *
 * Probes the spot the bar would take. If what is on top there is pinned and
 * is not the editor or the page behind it, the bar moves below it, and looks
 * again (a header can sit under a banner).
 */
function belowPinnedCover(
  x: number,
  y: number,
  root: HTMLElement,
  ignore: HTMLElement | null,
): number {
  let top = y;

  for (let attempt = 0; attempt < 4; attempt++) {
    const hit = document
      .elementsFromPoint(x, top)
      .find((element) => !ignore?.contains(element));
    // The note itself, or a container it sits in: nothing is covering it.
    if (!hit || root.contains(hit) || hit.contains(root)) break;

    let pinned: Element | null = hit;
    while (pinned && !pinned.contains(root)) {
      const { position } = getComputedStyle(pinned);
      if (position === "fixed" || position === "sticky") break;
      pinned = pinned.parentElement;
    }
    if (!pinned || pinned.contains(root)) break;

    const bottom = pinned.getBoundingClientRect().bottom;
    if (bottom <= top) break;
    top = bottom;
  }

  return top;
}

type HighlightRegistry = Map<string, unknown>;
type HighlightConstructor = new (...ranges: Range[]) => unknown;

function highlightApi(): {
  registry: HighlightRegistry;
  Highlight: HighlightConstructor;
} | null {
  const css = globalThis.CSS as unknown as { highlights?: HighlightRegistry };
  const Highlight = (globalThis as { Highlight?: HighlightConstructor })
    .Highlight;
  return css?.highlights && Highlight
    ? { registry: css.highlights, Highlight }
    : null;
}

export function FindReplacePlugin({
  isOpen: controlledIsOpen,
  onOpenChange: controlledOnOpenChange,
}: FindReplacePluginProperties = {}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isOpen = controlledIsOpen ?? uncontrolledOpen;
  const setOpen = controlledOnOpenChange ?? setUncontrolledOpen;

  const [query, setQuery] = useState("");
  const [replacement, setReplacement] = useState("");
  const [showReplace, setShowReplace] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [current, setCurrent] = useState(0);
  const [position, setPosition] = useState<{ top: number; right: number }>();

  const findInputReference = useRef<HTMLInputElement>(null);
  const barReference = useRef<HTMLDivElement>(null);
  const queryReference = useRef(query);
  useEffect(() => {
    queryReference.current = query;
  }, [query]);

  const refresh = useCallback(() => {
    const next = editor
      .getEditorState()
      .read(() => $findMatches(queryReference.current));
    setMatches(next);
    setCurrent((index) => Math.min(index, Math.max(0, next.length - 1)));
  }, [editor]);

  // Open: from Cmd/Ctrl+F, pre-filled with a one-line selection.
  const open = useCallback(
    (withReplace: boolean) => {
      const selected = editor.getEditorState().read(() => {
        const selection = $getSelection();
        return $isRangeSelection(selection) && !selection.isCollapsed()
          ? selection.getTextContent()
          : "";
      });
      if (selected && !selected.includes("\n")) setQuery(selected);
      setCurrent(0);
      if (withReplace) setShowReplace(true);
      setOpen(true);
      // Already open: take the caret back and select what is there.
      requestAnimationFrame(() => {
        findInputReference.current?.focus();
        findInputReference.current?.select();
      });
    },
    [editor, setOpen],
  );

  useEffect(
    () =>
      mergeRegister(
        editor.registerCommand(
          KEY_MODIFIER_COMMAND,
          (event) => {
            const key = event.key.toLowerCase();
            if (!(event.metaKey || event.ctrlKey) || event.altKey) return false;
            if (key !== "f" && key !== "h") return false;
            event.preventDefault();
            open(key === "h");
            return true;
          },
          COMMAND_PRIORITY_LOW,
        ),
      ),
    [editor, open],
  );

  // Search as the query changes, and again whenever the document does.
  useEffect(() => {
    if (!isOpen) return;
    refresh();
  }, [isOpen, query, refresh]);

  useEffect(() => {
    if (!isOpen) return;
    return editor.registerUpdateListener(({ dirtyElements, dirtyLeaves }) => {
      if (dirtyElements.size > 0 || dirtyLeaves.size > 0) refresh();
    });
  }, [editor, isOpen, refresh]);

  // Pin to the editor's top right, below whatever scrolls it.
  useLayoutEffect(() => {
    if (!isOpen) return;
    const root = editor.getRootElement();
    if (!root) return;
    const scroller = scrollParentOf(root);

    const place = () => {
      const box = root.getBoundingClientRect();
      const floor = Math.max(
        box.top,
        scroller ? scroller.getBoundingClientRect().top : 0,
        0,
      );
      const probeX = Math.min(
        Math.max(box.right - 16, 0),
        globalThis.innerWidth - 1,
      );
      const clear = belowPinnedCover(
        probeX,
        floor + 1,
        root,
        barReference.current,
      );
      setPosition({
        top: Math.max(floor, clear) + EDGE_GAP,
        right: Math.max(globalThis.innerWidth - box.right, 0),
      });
    };

    place();
    globalThis.addEventListener("scroll", place, true);
    globalThis.addEventListener("resize", place);
    return () => {
      globalThis.removeEventListener("scroll", place, true);
      globalThis.removeEventListener("resize", place);
    };
  }, [editor, isOpen]);

  // Draw every match, the current one on top, and bring it into view.
  useEffect(() => {
    const api = highlightApi();
    if (!api) return;

    if (!isOpen || matches.length === 0) {
      api.registry.delete(ALL_MATCHES_HIGHLIGHT);
      api.registry.delete(CURRENT_MATCH_HIGHLIGHT);
      return;
    }

    const length = queryReference.current.length;
    const ranges = matches.map((match) => {
      const element = editor.getElementByKey(match.key);
      const text = element ? firstTextNode(element) : null;
      if (!text) return null;
      const range = document.createRange();
      const end = Math.min(
        match.offset + length,
        text.textContent?.length ?? 0,
      );
      range.setStart(text, Math.min(match.offset, end));
      range.setEnd(text, end);
      return range;
    });

    api.registry.set(
      ALL_MATCHES_HIGHLIGHT,
      new api.Highlight(
        ...ranges.filter((range): range is Range => range !== null),
      ),
    );
    const active = ranges[current];
    if (active) {
      api.registry.set(CURRENT_MATCH_HIGHLIGHT, new api.Highlight(active));
      const element = editor.getElementByKey(matches[current]!.key);
      element?.scrollIntoView({ block: "center", behavior: "smooth" });
    } else {
      api.registry.delete(CURRENT_MATCH_HIGHLIGHT);
    }

    return () => {
      api.registry.delete(ALL_MATCHES_HIGHLIGHT);
      api.registry.delete(CURRENT_MATCH_HIGHLIGHT);
    };
  }, [editor, isOpen, matches, current]);

  const step = (direction: 1 | -1) => {
    if (matches.length === 0) return;
    setCurrent(
      (index) => (index + direction + matches.length) % matches.length,
    );
  };

  const close = () => {
    const match = matches[current];
    const length = query.length;
    setOpen(false);
    editor.update(() => {
      if (!match) return;
      const node = $getNodeByKey(match.key);
      if ($isTextNode(node)) node.select(match.offset, match.offset + length);
    });
    editor.focus();
  };

  // Replacing changes the text, and the update listener searches again — so
  // the next match slides into the current slot with its real offset, rather
  // than an offset worked out before the edit.
  const replaceCurrent = () => {
    const match = matches[current];
    if (!match) return;
    editor.update(() => {
      const node = $getNodeByKey(match.key);
      if ($isTextNode(node))
        node.spliceText(match.offset, query.length, replacement);
    });
  };

  const replaceAll = () => {
    if (matches.length === 0) return;
    editor.update(() => {
      // Back to front within each node, so earlier offsets stay true.
      for (const match of [...matches].reverse()) {
        const node = $getNodeByKey(match.key);
        if ($isTextNode(node))
          node.spliceText(match.offset, query.length, replacement);
      }
    });
  };

  if (!isOpen || !position) return null;

  const iconButton =
    "text-muted-foreground hover:bg-muted hover:text-foreground flex size-7 items-center justify-center rounded-md disabled:opacity-40";

  return createPortal(
    <div
      ref={barReference}
      data-slot="find-bar"
      role="search"
      style={{ top: position.top, right: position.right }}
      className="bg-popover text-popover-foreground fixed z-50 w-[22rem] max-w-[calc(100vw-1rem)] rounded-xl border shadow-lg"
    >
      <div className="flex items-center gap-1 py-1.5 pr-1.5 pl-3">
        <input
          ref={findInputReference}
          autoFocus
          aria-label="Find in note"
          placeholder="Find in note"
          value={query}
          onChange={(event) => {
            // A new query starts from its first match.
            setQuery(event.target.value);
            setCurrent(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              step(event.shiftKey ? -1 : 1);
            } else if (event.key === "Escape") {
              event.preventDefault();
              close();
            } else if (
              (event.metaKey || event.ctrlKey) &&
              event.key.toLowerCase() === "f"
            ) {
              event.preventDefault();
              event.currentTarget.select();
            }
          }}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
        <span
          data-slot="find-count"
          className="text-muted-foreground shrink-0 px-1 text-xs tabular-nums"
        >
          {query
            ? `${matches.length > 0 ? current + 1 : 0} of ${matches.length}`
            : ""}
        </span>
        <button
          type="button"
          aria-label="Previous match"
          disabled={matches.length === 0}
          onClick={() => step(-1)}
          className={iconButton}
        >
          <ArrowUp className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Next match"
          disabled={matches.length === 0}
          onClick={() => step(1)}
          className={iconButton}
        >
          <ArrowDown className="size-4" />
        </button>
        <button
          type="button"
          aria-label={showReplace ? "Hide replace" : "Show replace"}
          aria-pressed={showReplace}
          onClick={() => setShowReplace((shown) => !shown)}
          className={cn(iconButton, showReplace && "text-primary")}
        >
          <Replace className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Close find"
          onClick={close}
          className={iconButton}
        >
          <X className="size-4" />
        </button>
      </div>

      {showReplace ? (
        <div className="space-y-2 border-t px-3 py-2">
          <input
            aria-label="Replace with"
            placeholder="Replace with…"
            value={replacement}
            onChange={(event) => setReplacement(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                replaceCurrent();
              } else if (event.key === "Escape") {
                event.preventDefault();
                close();
              }
            }}
            className="w-full bg-transparent py-1 text-sm outline-none"
          />
          <div className="flex justify-end gap-2">
            <Button
              size="small"
              variant="text"
              disabled={matches.length === 0}
              onClick={replaceAll}
            >
              Replace all
            </Button>
            <Button
              size="small"
              type="primary"
              disabled={matches.length === 0}
              onClick={replaceCurrent}
            >
              Replace
            </Button>
          </div>
        </div>
      ) : null}
    </div>,
    document.body,
  );
}
