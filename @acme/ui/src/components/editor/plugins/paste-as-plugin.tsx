"use client";

/**
 * PasteAsPlugin
 *
 * Notion-style "Paste as" offer. Paste a URL the host recognises and a small
 * popover appears under it: insert it as a readable mention, or keep the URL.
 *
 * Two rules shape the whole plugin:
 *
 * 1. It never claims the paste. The URL has to land at the caret through the
 *    normal path, because the editor already runs a chain of paste handlers
 *    (block copy/paste, markdown, plain-text linebreak, drag-drop) and each is
 *    load-bearing for its own case. This one only reads the clipboard and
 *    yields, so adding it cannot change what any other paste does.
 *
 * 2. "Mention" rewrites a link, it does not introduce a node type. The
 *    published-render boundary keeps an explicit list of node types it refuses
 *    and `mention` is on it — and it rejects the WHOLE document, not the
 *    offending node, so a single mention node would blank the published view.
 *    The pill is marked with `rel="mention"` instead, which costs nothing: the
 *    link's serialized shape already carries `rel`, the content boundary
 *    already validates it, and the renderer already writes it onto the anchor.
 */
import type { LinkNode } from "@lexical/link";
import type { JSX } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { $createLinkNode, $isLinkNode } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
  $createTextNode,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_LOW,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  PASTE_COMMAND,
} from "lexical";
import { createPortal } from "react-dom";

import { cn } from "@acme/ui/lib/utils";

import { setFloatingElemPositionForLinkEditor } from "../utils/set-floating-elem-position-for-link-editor";

/** What the host knows about a pasted URL. */
export type ResolvedPasteLink = {
  title: string;
  /**
   * A short glyph, not an image URL. Images are a separate node type and a
   * link's text can only carry text — a glyph round-trips through every format
   * the editor supports.
   */
  icon?: string;
  /** A corrected target, for normalising a redirect or stripping tracking. */
  url?: string;
};

export type ResolvePasteLink = (
  url: string,
) => Promise<ResolvedPasteLink | null> | ResolvedPasteLink | null;

/** Used when the host resolves a link but offers no icon of its own. */
const DEFAULT_ICON = "📄";

/** Named rather than indexed, so no two call sites can disagree on the order. */
const PASTE_AS_OPTIONS = ["mention", "url"] as const;
type PasteAsOption = (typeof PASTE_AS_OPTIONS)[number];

const SUPPORTED_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * Whether this clipboard text is a bare URL and nothing else.
 *
 * Deliberately strict: a URL with words around it, or with a line break, is
 * somebody else's paste. Markdown cannot reach here either, since markdown
 * carries syntax that this rejects.
 */
function isSingleUrlPaste(text: string): boolean {
  const trimmed = text.trim();

  if (trimmed.length === 0 || /\s/.test(trimmed)) {
    return false;
  }

  try {
    return SUPPORTED_PROTOCOLS.has(new URL(trimmed).protocol);
  } catch {
    return false;
  }
}

/** The pasted URL's place in the document, as a text range. */
type PasteTarget = {
  textKey: string;
  start: number;
  end: number;
};

type Offer = {
  url: string;
  target: PasteTarget;
  resolved: ResolvedPasteLink;
  /** Viewport rect of the pasted link, captured when the offer opened. */
  rect: DOMRect | null;
};

/**
 * The text a mention reads as. One function, because the popover promises this
 * string and the document has to receive exactly it.
 */
function mentionLabel(resolved: ResolvedPasteLink): string {
  return `${resolved.icon ?? DEFAULT_ICON} ${resolved.title}`;
}

/**
 * Find the URL that was just pasted, ending at the caret.
 *
 * Read rather than assumed: auto-linking happens as a node transform, so at the
 * instant the paste handler returns the URL may still be plain text, and a
 * moment later the same text node may be sitting inside an auto-link. Anchoring
 * on the TEXT node survives both, and which one it turned out to be is decided
 * later, when the choice is applied.
 */
function $findPasteTarget(url: string): PasteTarget | null {
  const selection = $getSelection();

  if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
    return null;
  }

  const anchorNode = selection.anchor.getNode();

  if (!$isTextNode(anchorNode)) {
    return null;
  }

  const end = selection.anchor.offset;
  const start = end - url.length;

  if (start < 0 || anchorNode.getTextContent().slice(start, end) !== url) {
    return null;
  }

  return { textKey: anchorNode.getKey(), start, end };
}

/** Whether the caret is still sitting in the text the offer is about. */
function $isStillAnchored(target: PasteTarget): boolean {
  if ($getNodeByKey(target.textKey) === null) {
    return false;
  }

  const selection = $getSelection();

  return (
    $isRangeSelection(selection) &&
    selection.anchor.getNode().getKey() === target.textKey
  );
}

/**
 * Turn the pasted URL into a mention link.
 *
 * An auto-link is REPLACED rather than edited: its transform re-checks that its
 * text still looks like a URL, so editing one in place to read "📄 Title" would
 * have it unwrap itself again.
 */
function $applyMention(offer: Offer): boolean {
  const node = $getNodeByKey(offer.target.textKey);

  if (!$isTextNode(node)) {
    return false;
  }

  const mention = $createLinkNode(offer.resolved.url ?? offer.url, {
    rel: "mention",
  });
  mention.append($createTextNode(mentionLabel(offer.resolved)));

  const existingLink = $findMatchingParent(
    node,
    $isLinkNode,
  ) as LinkNode | null;

  if (existingLink) {
    existingLink.replace(mention);
    mention.selectEnd();
    return true;
  }

  let urlNode = node;

  if (offer.target.start > 0) {
    const [, afterStart] = urlNode.splitText(offer.target.start);
    if (!afterStart) return false;
    urlNode = afterStart;
  }

  if (urlNode.getTextContent().length > offer.url.length) {
    const [urlOnly] = urlNode.splitText(offer.url.length);
    if (!urlOnly) return false;
    urlNode = urlOnly;
  }

  urlNode.replace(mention);
  mention.selectEnd();
  return true;
}

/**
 * Where the pasted text sits on screen. The caret's own range is the truthful
 * answer while the paste is still plain text; the element is the fallback for
 * when there is no live selection to read.
 */
function rectForCaret(fallbackElement: HTMLElement | null): DOMRect | null {
  const selection = globalThis.getSelection?.();

  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    if (typeof range.getBoundingClientRect === "function") {
      return range.getBoundingClientRect();
    }
  }

  return fallbackElement?.getBoundingClientRect() ?? null;
}

export function PasteAsPlugin({
  anchorElem,
  resolvePasteLink,
}: {
  anchorElem: HTMLElement | null;
  resolvePasteLink?: ResolvePasteLink;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [activeOption, setActiveOption] = useState<PasteAsOption>("mention");
  const popoverReference = useRef<HTMLDivElement | null>(null);

  /** URL awaiting its place in the document, set by the paste and read once. */
  const pendingUrlReference = useRef<string | null>(null);
  /**
   * Bumped whenever an offer is superseded or abandoned. A resolution carrying
   * a stale token is dropped, which is what keeps a slow resolver from opening
   * a popover next to text the user has already left.
   */
  const resolutionTokenReference = useRef(0);

  const closeOffer = useCallback(() => {
    resolutionTokenReference.current += 1;
    setOffer(null);
    setActiveOption("mention");
  }, []);

  // Read the clipboard, then get out of the way. Returning false is the whole
  // contract with the other paste handlers.
  useEffect(() => {
    if (!resolvePasteLink) return;

    return editor.registerCommand(
      PASTE_COMMAND,
      (event) => {
        if (!event || !("clipboardData" in event)) return false;

        const text = event.clipboardData?.getData("text/plain") ?? "";

        pendingUrlReference.current = isSingleUrlPaste(text)
          ? text.trim()
          : null;

        if (pendingUrlReference.current) {
          closeOffer();
        }

        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [closeOffer, editor, resolvePasteLink]);

  // Once the paste has landed, locate it and ask the host about it.
  useEffect(() => {
    if (!resolvePasteLink) return;

    return editor.registerUpdateListener(({ editorState }) => {
      const pendingUrl = pendingUrlReference.current;

      if (!pendingUrl) {
        // An offer the caret has left, or whose text is gone, has nothing to
        // point at any more.
        setOffer((current) => {
          if (!current) return current;
          return editorState.read(() => $isStillAnchored(current.target))
            ? current
            : null;
        });
        return;
      }

      pendingUrlReference.current = null;

      const target = editorState.read(() => $findPasteTarget(pendingUrl));
      if (!target) return;

      resolutionTokenReference.current += 1;
      const token = resolutionTokenReference.current;

      void (async () => {
        const resolved = await resolvePasteLink(pendingUrl);

        if (!resolved || token !== resolutionTokenReference.current) {
          return;
        }

        const stillThere = editor
          .getEditorState()
          .read(() => $getNodeByKey(target.textKey) !== null);

        if (!stillThere) return;

        setActiveOption("mention");
        setOffer({
          url: pendingUrl,
          target,
          resolved,
          rect: rectForCaret(editor.getElementByKey(target.textKey)),
        });
      })();
    });
  }, [editor, resolvePasteLink]);

  const choose = useCallback(
    (option: PasteAsOption) => {
      if (!offer) return;

      closeOffer();

      // "URL" is the document exactly as the paste left it, so there is nothing
      // to apply.
      if (option === "url") return;

      // Untagged on purpose. A history-merge tag would fold this into the paste
      // — one undo instead of two — but the change plugin drops history-merge
      // updates, so the mention would never reach the host's onChange and would
      // be lost on the next save.
      editor.update(() => {
        $applyMention(offer);
      });
    },
    [closeOffer, editor, offer],
  );

  // While the offer is up these four keys belong to it — without this, Enter
  // would split the paragraph instead of choosing.
  useEffect(() => {
    if (!offer) return;

    const step = (direction: 1 | -1) => {
      setActiveOption((current) => {
        const next =
          (PASTE_AS_OPTIONS.indexOf(current) +
            direction +
            PASTE_AS_OPTIONS.length) %
          PASTE_AS_OPTIONS.length;
        return PASTE_AS_OPTIONS[next] ?? current;
      });
    };

    return mergeRegister(
      editor.registerCommand(
        KEY_ARROW_DOWN_COMMAND,
        (event) => {
          event?.preventDefault();
          step(1);
          return true;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        KEY_ARROW_UP_COMMAND,
        (event) => {
          event?.preventDefault();
          step(-1);
          return true;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        (event) => {
          event?.preventDefault();
          choose(activeOption);
          return true;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          closeOffer();
          return true;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [activeOption, choose, closeOffer, editor, offer]);

  // Typing dismisses the offer, and the keystroke still reaches the editor —
  // nothing here prevents the default. Leaving the editor dismisses it too.
  useEffect(() => {
    if (!offer) return;

    const rootElement = editor.getRootElement();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if ([...event.key].length === 1) closeOffer();
    };

    rootElement?.addEventListener("keydown", handleKeyDown);
    rootElement?.addEventListener("blur", closeOffer);

    return () => {
      rootElement?.removeEventListener("keydown", handleKeyDown);
      rootElement?.removeEventListener("blur", closeOffer);
    };
  }, [closeOffer, editor, offer]);

  useEffect(() => {
    if (!offer) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest("[data-paste-as-offer]") !== null
      ) {
        return;
      }
      closeOffer();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [closeOffer, offer]);

  // Positioned with the editor's own floating-element positioner, against the
  // anchor element — never `position: fixed`, which re-anchors to any ancestor
  // carrying a transform, filter or `contain` and threw the editor's other
  // overlays across the page on docs pages. A negative vertical gap turns its
  // above-the-target placement into below-the-target, and its horizontal
  // clamping to the editor's scroller comes along for free.
  useEffect(() => {
    const popover = popoverReference.current;
    if (!offer || !popover || !anchorElem) return;

    setFloatingElemPositionForLinkEditor(
      offer.rect,
      popover,
      anchorElem,
      -((offer.rect?.height ?? 0) + 6),
      0,
    );
  }, [anchorElem, offer]);

  if (!offer || !anchorElem) {
    return null;
  }

  const labels: Record<PasteAsOption, string> = {
    mention: mentionLabel(offer.resolved),
    url: "URL",
  };

  return createPortal(
    <div
      data-paste-as-offer
      ref={popoverReference}
      style={{ position: "absolute", top: 0, left: 0, zIndex: 50 }}
    >
      {/*
        Plain markup rather than the shared Command primitives the other editor
        menus use, and the reasons are evidence rather than taste: cmdk needs a
        ResizeObserver, which the agreed jsdom seam does not have, so using it
        would leave this feature's only tests unable to see the popover at all;
        and cmdk owns both `aria-selected` and the arrow keys, which is exactly
        what the editor's command layer has to own here — the mentions plugin
        already has to re-implement its arrows inside an onKeyDown to work
        around that. The classes are the menu's, so it still reads as one.
      */}
      <div
        aria-label="Paste as"
        className="bg-popover text-popover-foreground min-w-48 rounded-md border p-1 shadow-md"
        role="listbox"
      >
        <div className="text-muted-foreground px-2 py-1 text-xs">Paste as</div>
        {PASTE_AS_OPTIONS.map((option) => (
          <button
            aria-selected={option === activeOption}
            className={cn(
              "flex w-full cursor-default items-center rounded-sm px-2 py-1.5 text-left text-sm outline-hidden",
              option === activeOption && "bg-accent text-accent-foreground",
            )}
            key={option}
            onClick={() => choose(option)}
            // Keep the caret where it is; a click must not blur the editor.
            onMouseDown={(event) => event.preventDefault()}
            role="option"
            type="button"
          >
            {labels[option]}
          </button>
        ))}
      </div>
    </div>,
    anchorElem,
  );
}
