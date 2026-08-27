"use client";

import type { ReactNode } from "react";
import { useCallback, useRef, useState } from "react";
import { CornerDownLeftIcon, SquareIcon } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@acme/ui/components/input-group";
import { cn } from "@acme/ui/lib/utils";

import type { ComposerFormat } from "./composer-submit-plugin";
import { Editor } from "../editor";
import { ComposerSubmitPlugin } from "./composer-submit-plugin";

export type ComposerProps = {
  /**
   * Defaults to markdown: it is what an assistant is going to be sent anyway, and
   * it still reads as plain text if the transport is not rich.
   */
  format?: ComposerFormat;
  placeholder?: string;
  onSubmit: (value: string) => void;
  /**
   * True while a reply is streaming. The composer stays editable so the next
   * message can be drafted; only sending is held back.
   */
  busy?: boolean;
  /**
   * Attachment previews, rendered inside the box above the text — where what is
   * about to be sent belongs, rather than floating above the border.
   */
  attachments?: ReactNode;
  /**
   * Controls that belong to the message but not to its text: file pickers, model
   * selectors, mode switches. Rendered in a row **below** the box, so the border
   * contains only the message itself.
   *
   * The row is a plain flex line — put `ml-auto` on a child to push the rest of
   * the group to the right.
   */
  actions?: ReactNode;
  onStop?: () => void;
  autoFocus?: boolean;
  className?: string;
};

export function Composer({
  format = "markdown",
  placeholder = "Send a message...",
  onSubmit,
  busy = false,
  attachments,
  actions,
  onStop,
  autoFocus = false,
  className,
}: ComposerProps) {
  const [isEmpty, setIsEmpty] = useState(true);
  const submitReference = useRef<(() => void) | null>(null);

  const bindSubmit = useCallback((submit: () => void) => {
    submitReference.current = submit;
  }, []);

  // Emptiness comes from the word-count plugin, which `Editor` renders eagerly.
  // Deriving it from the value would tie the button's enabled state to the
  // lazily-loaded format plugins.
  const handleStatsChange = useCallback((stats: { characterCount: number }) => {
    setIsEmpty(stats.characterCount === 0);
  }, []);

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {/*
       * `h-auto`: InputGroup is a single-line control by default and only relaxes
       * for a `>textarea` child or a block-aligned addon. The composer is neither,
       * so without this it stays pinned at 36px however much is typed.
       */}
      <InputGroup className="h-auto flex-col items-stretch">
        {attachments && (
          <InputGroupAddon align="block-start">{attachments}</InputGroupAddon>
        )}

        {/*
         * `items-end` is what keeps the send button on the last line of the
         * message instead of dropping to its own row underneath — which is what a
         * block-end addon would do.
         */}
        <div className="flex items-end">
          {/*
            Editor forwards className to an inner scroll container, so a flex-1
            handed to it lands a level below this row and the typing area
            collapses to the width of its text. The growth has to live on the
            element that is actually this row's child; min-w-0 keeps a long
            unbroken word from pushing past the border.
          */}
          <div className="min-w-0 flex-1">
            <Editor
              autoFocus={autoFocus}
              // The editor defaults to a document's min-height (300px, 400px
              // from sm); a composer sizes to its content. Scrolling stays on
              // that container, so the content class only carries padding — two
              // nested scroll areas would fight each other.
              className="max-h-64 min-h-0 sm:min-h-0"
              contentClassName="px-3 py-2.5"
              format={format as "markdown"}
              onStatsChange={handleStatsChange}
              placeholder={placeholder}
              variant="minimal"
            >
              <ComposerSubmitPlugin
                bindSubmit={bindSubmit}
                disabled={busy}
                format={format}
                onSubmit={onSubmit}
              />
            </Editor>
          </div>

          <div className="shrink-0 pr-2 pb-2">
            <InputGroupButton
              aria-label={busy ? "Stop generating" : "Send message"}
              disabled={busy ? !onStop : isEmpty}
              onClick={() => {
                if (busy) {
                  onStop?.();
                  return;
                }

                submitReference.current?.();
              }}
              size="icon-sm"
              variant="ghost"
            >
              {busy ? (
                <SquareIcon className="size-3 fill-current" />
              ) : (
                <CornerDownLeftIcon />
              )}
            </InputGroupButton>
          </div>
        </div>
      </InputGroup>

      {actions && (
        <div className="text-muted-foreground flex items-center gap-1 px-1 text-sm">
          {actions}
        </div>
      )}
    </div>
  );
}
