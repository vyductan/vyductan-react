import type { NodeKey } from "lexical";
import type { JSX } from "react";
import { useEffect, useMemo, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNearestNodeFromDOMNode, $getNodeByKey } from "lexical";
import { createPortal } from "react-dom";

import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@acme/ui/components/popover";

import { $isCalloutNode, CALLOUT_COLORS } from "../nodes/callout-node";
import emojiList from "../utils/emoji-list";

/**
 * Clicking a callout's icon opens one picker for both of its properties: a
 * row of Notion's background colors and an emoji search.
 *
 * The icon is CSS (`::before`, see nodes/callout-node.ts), so there is no
 * element to attach a handler to. A click is on the icon when it lands on the
 * callout box itself — not on its text — inside the left padding the icon sits
 * in. That strip stays clickable after "Remove icon", so the picker can still
 * be reached to add one back.
 */

const EMOJI_LIMIT = 96;

interface Target {
  key: NodeKey;
  anchor: { top: number; left: number; width: number; height: number };
}

function iconHit(event: MouseEvent): HTMLElement | null {
  const target = event.target;
  if (!(target instanceof HTMLElement) || !target.classList.contains("Callout"))
    return null;
  const rect = target.getBoundingClientRect();
  const paddingLeft = Number.parseFloat(getComputedStyle(target).paddingLeft);
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return x >= 0 && x < paddingLeft && y >= 0 && y < Math.max(paddingLeft, 32)
    ? target
    : null;
}

export function CalloutPickerPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const [target, setTarget] = useState<Target | null>(null);
  const [query, setQuery] = useState("");

  useEffect(
    () =>
      editor.registerRootListener((root, previousRoot) => {
        // Keep the caret where it was: a click on the icon is not a click
        // into the text.
        const onMouseDown = (event: MouseEvent) => {
          if (iconHit(event)) event.preventDefault();
        };
        const onClick = (event: MouseEvent) => {
          const callout = iconHit(event);
          if (!callout) return;
          const key = editor.read(() => {
            const node = $getNearestNodeFromDOMNode(callout);
            return $isCalloutNode(node) ? node.getKey() : null;
          });
          if (!key) return;
          const rect = callout.getBoundingClientRect();
          setQuery("");
          setTarget({
            key,
            anchor: {
              top: rect.top + 8,
              left: rect.left + 8,
              width: 28,
              height: 28,
            },
          });
        };

        previousRoot?.removeEventListener("mousedown", onMouseDown);
        previousRoot?.removeEventListener("click", onClick);
        root?.addEventListener("mousedown", onMouseDown);
        root?.addEventListener("click", onClick);
      }),
    [editor],
  );

  const emojis = useMemo(() => {
    const words = query.trim().toLowerCase();
    const matches = words
      ? emojiList.filter(
          ({ description, aliases, tags }) =>
            description.includes(words) ||
            aliases.some((alias) => alias.includes(words)) ||
            tags.some((tag) => tag.includes(words)),
        )
      : emojiList;
    return matches.slice(0, EMOJI_LIMIT);
  }, [query]);

  const update = (change: { icon?: string; color?: string }) => {
    if (!target) return;
    editor.update(() => {
      const node = $getNodeByKey(target.key);
      if (!$isCalloutNode(node)) return;
      if (change.icon !== undefined) node.setIcon(change.icon);
      if (change.color !== undefined) node.setColor(change.color);
    });
  };

  const close = () => {
    setTarget(null);
    editor.focus();
  };

  return (
    <Popover
      open={target !== null}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      {target &&
        createPortal(
          <PopoverAnchor asChild>
            <div
              aria-hidden
              style={{
                position: "fixed",
                ...target.anchor,
                pointerEvents: "none",
              }}
            />
          </PopoverAnchor>,
          document.body,
        )}
      <PopoverContent align="start" side="bottom" className="w-80 p-2">
        <div
          aria-label="Callout icon and color"
          className="flex flex-col gap-2"
        >
          <div className="flex flex-wrap gap-1">
            {CALLOUT_COLORS.map(({ color, label }) => (
              <button
                key={color || "default"}
                type="button"
                aria-label={`${label} background`}
                title={label}
                data-color={color || undefined}
                className="CalloutSwatch border-border size-6 rounded border"
                onClick={() => update({ color })}
              />
            ))}
          </div>
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search emoji"
            className="border-input bg-background h-8 rounded border px-2 text-sm outline-none"
          />
          <div className="grid max-h-56 grid-cols-8 gap-0.5 overflow-y-auto">
            {emojis.map(({ emoji, description }) => (
              <button
                key={emoji}
                type="button"
                aria-label={description}
                title={description}
                className="hover:bg-muted rounded p-1 text-xl leading-none"
                onClick={() => {
                  update({ icon: emoji });
                  close();
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="text-muted-foreground hover:bg-muted self-start rounded px-2 py-1 text-sm"
            onClick={() => {
              update({ icon: "" });
              close();
            }}
          >
            Remove icon
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
