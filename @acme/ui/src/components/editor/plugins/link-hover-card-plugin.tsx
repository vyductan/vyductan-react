"use client";

import type { LinkNode } from "@lexical/link";
import type { LexicalEditor } from "lexical";
import type { JSX, KeyboardEvent as ReactKeyboardEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { $createLinkNode, $isAutoLinkNode, $isLinkNode } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $findMatchingParent } from "@lexical/utils";
import {
  $createTextNode,
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
  $isTextNode,
} from "lexical";
import { Copy, Globe, Trash } from "lucide-react";
import { createPortal } from "react-dom";

import { $isPageLinkNode } from "../utils/page-link";
import { sanitizeUrl } from "../utils/url";

// Long enough that sweeping the pointer across a paragraph opens nothing.
const OPEN_DELAY_MS = 300;
// Long enough to cross the gap from the link into the card.
const CLOSE_DELAY_MS = 150;
const CARD_WIDTH = 340;
const GAP = 6;

// Page links (`rel="mention"`) have their own preview card.
const LINK_SELECTOR = 'a[href]:not([rel~="mention"])';
const MODIFIER_KEYS = new Set(["Meta", "Control", "Alt", "Shift", "CapsLock"]);

type Open = {
  key: string;
  url: string;
  title: string;
  rect: DOMRect;
  editing: boolean;
};

/** The link a DOM anchor in the editor stands for, page links aside. */
function $linkOf(anchor: Element): LinkNode | null {
  const node = $getNearestNodeFromDOMNode(anchor);
  if (!node) return null;
  const link = $isLinkNode(node)
    ? node
    : $findMatchingParent(node, $isLinkNode);
  return $isLinkNode(link) && !$isPageLinkNode(link) ? link : null;
}

/**
 * Notion's link card: hovering a link shows where it goes, Copy and Edit;
 * Edit turns it into a form for the URL and the title, with Remove link.
 *
 * It follows the pointer, not the caret. The caret-driven popup it replaces
 * opened whenever the caret landed in a link — under the context menu on a
 * right-click, and in the way of plain typing.
 */
export function LinkHoverCardPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const [open, setOpen] = useState<Open | null>(null);

  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The anchor the pointer is on now.
  const hovered = useRef<Element | null>(null);
  // The form, once open, stays until it is done with: read by the pointer
  // listeners, which outlive any one render.
  const editing = useRef(false);

  const clearTimers = useCallback(() => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
  }, []);

  const close = useCallback(() => {
    clearTimers();
    hovered.current = null;
    editing.current = false;
    setOpen(null);
  }, [clearTimers]);

  const scheduleClose = useCallback(() => {
    if (editing.current) return;
    if (openTimer.current) clearTimeout(openTimer.current);
    openTimer.current = null;
    hovered.current = null;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), CLOSE_DELAY_MS);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }, []);

  useEffect(() => {
    const show = (anchor: Element) => {
      if (hovered.current !== anchor || !anchor.isConnected) return;
      const found = editor.read(() => {
        const link = $linkOf(anchor);
        return link
          ? {
              key: link.getKey(),
              url: link.getURL(),
              title: link.getTextContent(),
            }
          : null;
      });
      if (!found) return;
      setOpen({
        ...found,
        rect: anchor.getBoundingClientRect(),
        editing: false,
      });
    };

    const onOver = (event: PointerEvent) => {
      if (editing.current || !editor.isEditable()) return;
      const anchor = (event.target as Element | null)?.closest?.(LINK_SELECTOR);
      if (!anchor) return;

      cancelClose();
      if (hovered.current === anchor) return;
      hovered.current = anchor;

      if (openTimer.current) clearTimeout(openTimer.current);
      openTimer.current = setTimeout(() => show(anchor), OPEN_DELAY_MS);
    };

    const onOut = (event: PointerEvent) => {
      const anchor = (event.target as Element | null)?.closest?.(LINK_SELECTOR);
      if (!anchor) return;
      const next = event.relatedTarget as Node | null;
      if (next && anchor.contains(next)) return;
      scheduleClose();
    };

    // Typing means the writer has moved on. A modifier on its own does not:
    // holding ⌘ is how a link is opened.
    const dismiss = (event: KeyboardEvent) => {
      if (MODIFIER_KEYS.has(event.key) || editing.current) return;
      close();
    };

    return editor.registerRootListener((root, previous) => {
      if (previous) {
        previous.removeEventListener("pointerover", onOver);
        previous.removeEventListener("pointerout", onOut);
        previous.removeEventListener("keydown", dismiss);
      }
      if (root) {
        root.addEventListener("pointerover", onOver);
        root.addEventListener("pointerout", onOut);
        root.addEventListener("keydown", dismiss);
      }
    });
  }, [editor, scheduleClose, cancelClose, close]);

  // The card is placed by the link's box; once the page scrolls under it,
  // it is in the wrong place.
  const openKey = open?.key;
  useEffect(() => {
    if (openKey === undefined) return;
    const onScroll = () => {
      if (!editing.current) {
        close();
        return;
      }
      const element = editor.getElementByKey(openKey);
      if (element) {
        const rect = element.getBoundingClientRect();
        setOpen((current) => (current ? { ...current, rect } : current));
      }
    };
    globalThis.addEventListener("scroll", onScroll, true);
    return () => globalThis.removeEventListener("scroll", onScroll, true);
  }, [openKey, editor, close]);

  useEffect(() => clearTimers, [clearTimers]);

  if (!open) return null;

  const left = Math.max(
    8,
    Math.min(open.rect.left, globalThis.innerWidth - CARD_WIDTH - 8),
  );

  return createPortal(
    <div
      data-slot="link-hover-card"
      onPointerEnter={cancelClose}
      onPointerLeave={scheduleClose}
      style={{ top: open.rect.bottom + GAP, left, maxWidth: CARD_WIDTH }}
      className="fixed z-50 rounded-lg border bg-popover text-popover-foreground shadow-lg"
    >
      {open.editing ? (
        <LinkEditForm
          editor={editor}
          open={open}
          onDone={() => {
            close();
            editor.focus();
          }}
        />
      ) : (
        <div className="flex items-center gap-1 py-1 pr-1 pl-3 text-sm">
          <Globe className="size-4 shrink-0 text-muted-foreground" />
          <a
            href={sanitizeUrl(open.url)}
            target="_blank"
            rel="noopener noreferrer"
            data-open-link
            className="min-w-0 flex-1 truncate px-1 text-muted-foreground hover:underline"
          >
            {open.url}
          </a>
          <button
            type="button"
            aria-label="Copy link"
            title="Copy link"
            className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={() => void copyText(open.url)}
          >
            <Copy className="size-4" />
          </button>
          <button
            type="button"
            className="rounded px-2 py-1 hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              clearTimers();
              editing.current = true;
              setOpen({ ...open, editing: true });
            }}
          >
            Edit
          </button>
        </div>
      )}
    </div>,
    document.body,
  );
}

function LinkEditForm({
  editor,
  open,
  onDone,
}: {
  editor: LexicalEditor;
  open: Open;
  onDone: () => void;
}): JSX.Element {
  const [url, setUrl] = useState(open.url);
  const [title, setTitle] = useState(open.title);
  const formRef = useRef<HTMLFormElement>(null);

  // A click anywhere else is done with the form, as Notion has it; what was
  // typed is kept only by Enter.
  useEffect(() => {
    const onDown = (event: PointerEvent) => {
      if (!formRef.current?.contains(event.target as Node)) onDone();
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [onDone]);

  const save = () => {
    const nextUrl = url.trim();
    editor.update(() => {
      const node = $getNodeByKey(open.key);
      if (!$isLinkNode(node)) return;
      if (nextUrl === "") {
        $unwrapLink(node);
        return;
      }
      let link = node;
      // An autolink follows its text; once edited by hand it is a link.
      if ($isAutoLinkNode(node)) {
        link = $createLinkNode(node.getURL(), {
          rel: node.getRel(),
          target: node.getTarget(),
          title: node.getTitle(),
        });
        node.replace(link, true);
      }
      link.setURL(sanitizeUrl(nextUrl));
      const nextTitle = title.trim() === "" ? nextUrl : title;
      if (nextTitle !== link.getTextContent()) {
        // Keep the first run's format (bold, color) for the new text.
        const first = link.getFirstDescendant();
        const text = $createTextNode(nextTitle);
        if ($isTextNode(first)) {
          text.setFormat(first.getFormat());
          text.setStyle(first.getStyle());
        }
        // New text in before the old goes: a link left empty is removed.
        const old = link.getChildren();
        link.append(text);
        for (const child of old) child.remove();
      }
    });
    onDone();
  };

  const remove = () => {
    editor.update(() => {
      const node = $getNodeByKey(open.key);
      if ($isLinkNode(node)) $unwrapLink(node);
    });
    onDone();
  };

  const onKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onDone();
    }
  };

  const field =
    "w-full rounded-md border bg-muted/40 px-2 py-1.5 text-sm outline-none focus:border-primary";

  return (
    <form
      ref={formRef}
      className="w-[340px] space-y-2 p-3 text-sm"
      onKeyDown={onKeyDown}
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <label className="block space-y-1">
        <span className="text-xs font-medium text-muted-foreground">
          Page or URL
        </span>
        <input
          className={field}
          value={url}
          onChange={(event) => setUrl(event.target.value)}
        />
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-medium text-muted-foreground">
          Link title
        </span>
        <input
          className={field}
          value={title}
          autoFocus
          onFocus={(event) => event.target.select()}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>
      {/* Enter in either field saves. */}
      <button type="submit" hidden />
      <div className="-mx-3 border-t pt-1">
        <button
          type="button"
          className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-accent hover:text-accent-foreground"
          onClick={remove}
        >
          <Trash className="size-4" />
          Remove link
        </button>
      </div>
    </form>
  );
}

/** The link gone, its text left where it was. */
function $unwrapLink(link: LinkNode) {
  for (const child of link.getChildren()) link.insertBefore(child);
  link.remove();
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Webviews may refuse the async clipboard; the copy command still works.
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
}
