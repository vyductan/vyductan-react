"use client";

import type { JSX } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { createPortal } from "react-dom";

import { normalizeEditorContent } from "../render/normalize-editor-content";
import { renderRootNodes } from "../render/render-node";
import { DEFAULT_PAGE_ICON } from "../utils/page-link";

/** What the host shows for a linked page. */
export type PageLinkPreview = {
  title: string;
  icon?: string;
  /** Where the page lives, e.g. "Work / Trips". */
  breadcrumb?: string;
  /**
   * The opening of the page as serialized Lexical JSON, rendered with its
   * formatting. Keep it to the first few text blocks: the static renderer
   * refuses a whole document over one node type it does not support, and the
   * card then falls back to `excerpt`.
   */
  content?: string;
  /** The opening of the page's text, already plain. */
  excerpt?: string;
};

export type ResolvePageLinkPreview = (
  url: string,
) => Promise<PageLinkPreview | null> | PageLinkPreview | null;

// Long enough that sweeping the pointer across a paragraph opens nothing.
const OPEN_DELAY_MS = 350;
// Long enough to cross the gap from the pill into the card.
const CLOSE_DELAY_MS = 150;
const CARD_WIDTH = 320;
const GAP = 6;

const PAGE_LINK_SELECTOR = 'a[rel~="mention"]';
const MODIFIER_KEYS = new Set(["Meta", "Control", "Alt", "Shift", "CapsLock"]);

type Open = { url: string; rect: DOMRect; preview: PageLinkPreview | null };

/**
 * Notion-style hover preview for page links (`rel="mention"` pills).
 *
 * Listens on the root element rather than per link, so pills added, pasted or
 * undone later need no wiring. Answers are cached per URL for the life of the
 * editor: a preview is a glance, and re-asking on every hover would put a
 * request behind every pointer pass.
 */
export function PageLinkHoverCardPlugin({
  resolvePageLinkPreview,
}: {
  resolvePageLinkPreview: ResolvePageLinkPreview;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const [open, setOpen] = useState<Open | null>(null);

  const cache = useRef(new Map<string, PageLinkPreview | null>());
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The link the pointer is on now; a slow answer for another one is dropped.
  const hovered = useRef<string | null>(null);

  const clearTimers = useCallback(() => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
  }, []);

  const scheduleClose = useCallback(() => {
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

  const show = useCallback(
    async (anchor: HTMLAnchorElement) => {
      const url = anchor.getAttribute("href");
      if (!url) return;

      let preview = cache.current.get(url);
      if (preview === undefined) {
        try {
          preview = await resolvePageLinkPreview(url);
        } catch {
          preview = null;
        }
        cache.current.set(url, preview);
      }

      if (hovered.current !== url || !anchor.isConnected) return;
      setOpen(
        preview ? { url, rect: anchor.getBoundingClientRect(), preview } : null,
      );
    },
    [resolvePageLinkPreview],
  );

  useEffect(() => {
    const onOver = (event: PointerEvent) => {
      const anchor = (event.target as Element | null)?.closest?.(
        PAGE_LINK_SELECTOR,
      );
      if (!(anchor instanceof HTMLAnchorElement)) return;

      cancelClose();
      const url = anchor.getAttribute("href");
      if (hovered.current === url) return;
      hovered.current = url;

      if (openTimer.current) clearTimeout(openTimer.current);
      openTimer.current = setTimeout(() => {
        void show(anchor);
      }, OPEN_DELAY_MS);
    };

    const onOut = (event: PointerEvent) => {
      const anchor = (event.target as Element | null)?.closest?.(
        PAGE_LINK_SELECTOR,
      );
      if (!anchor) return;
      const next = event.relatedTarget as Node | null;
      if (next && anchor.contains(next)) return;
      scheduleClose();
    };

    // Typing means the reader has moved on. A modifier on its own does not:
    // holding ⌘ is how a link is opened, and the card should still be there
    // while the reader decides.
    const dismiss = (event: KeyboardEvent) => {
      if (MODIFIER_KEYS.has(event.key)) return;
      clearTimers();
      hovered.current = null;
      setOpen(null);
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
  }, [editor, show, scheduleClose, cancelClose, clearTimers]);

  useEffect(() => {
    if (!open) return;
    const dismiss = () => setOpen(null);
    globalThis.addEventListener("scroll", dismiss, true);
    return () => globalThis.removeEventListener("scroll", dismiss, true);
  }, [open]);

  useEffect(() => clearTimers, [clearTimers]);

  if (!open?.preview) return null;

  const { rect, preview } = open;
  const richContent = preview.content
    ? normalizeEditorContent(preview.content)
    : null;
  const left = Math.max(
    8,
    Math.min(rect.left, globalThis.innerWidth - CARD_WIDTH - 8),
  );

  return createPortal(
    <div
      data-slot="page-link-preview"
      role="tooltip"
      onPointerEnter={cancelClose}
      onPointerLeave={scheduleClose}
      style={{ top: rect.bottom + GAP, left, width: CARD_WIDTH }}
      className="bg-popover text-popover-foreground fixed z-50 space-y-1 rounded-lg border p-4 shadow-lg"
    >
      {preview.breadcrumb && (
        <p className="text-muted-foreground truncate text-xs">
          {preview.breadcrumb}
        </p>
      )}
      <p data-slot="page-link-preview-title" className="font-semibold">
        {/* Inline, like the pill itself: a wrapped title continues under the
            icon instead of hanging in a column beside it. */}
        <span className="mr-1.5" aria-hidden>
          {preview.icon ?? DEFAULT_PAGE_ICON}
        </span>
        {preview.title}
      </p>
      {richContent ? (
        // Scaled down to card size: the page's own heading sizes and block
        // spacing would let one heading fill the card. The fade marks the cut
        // where a line clamp cannot reach, since the content spans blocks.
        <div className="text-muted-foreground max-h-28 overflow-hidden [mask-image:linear-gradient(to_bottom,black_70%,transparent)] pt-1 text-sm [&_*]:!my-0.5 [&_*]:!text-sm [&_h1,&_h2,&_h3,&_h4]:font-semibold">
          {renderRootNodes(richContent.root.children)}
        </div>
      ) : (
        preview.excerpt && (
          <p className="text-muted-foreground line-clamp-4 pt-1 text-sm">
            {preview.excerpt}
          </p>
        )
      )}
    </div>,
    document.body,
  );
}
