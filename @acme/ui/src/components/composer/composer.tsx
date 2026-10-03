"use client";

import type { ReactNode } from "react";
import { useCallback, useRef, useState } from "react";
import { MicIcon, SendHorizontalIcon, SquareIcon } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@acme/ui/components/input-group";
import { cn } from "@acme/ui/lib/utils";

import type { MentionData } from "../editor";
import type { ComposerFormat } from "./composer-submit-plugin";
import type { DictationErrorCode } from "./use-dictation";
import { Editor } from "../editor";
import { ComposerSubmitPlugin } from "./composer-submit-plugin";
import { useDictation } from "./use-dictation";

export type ComposerDictation = {
  /** BCP 47 tag the recognizer listens for, e.g. `en-US`. */
  lang?: string;
  /** A take that could not start or broke off — permission refused, say. */
  onError?: (code: DictationErrorCode) => void;
};

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
   * A control inside the box, left of the text — an "add attachment" button,
   * say. Sits on the last line with the send button, so the box stays one
   * row tall for a one-line message.
   */
  leading?: ReactNode;
  /**
   * `small` tightens the padding between the border and the text, and the
   * buttons with it — for a composer in a narrow card or on a phone. The text
   * size is the editor's own and does not change — except on a touch device,
   * where the box types at 16px at every size so iOS does not zoom on focus.
   */
  size?: "small" | "middle";
  /**
   * Controls that belong to the message but not to its text: file pickers, model
   * selectors, mode switches. Rendered in a row **below** the box, so the border
   * contains only the message itself.
   *
   * The row is a plain flex line — put `ml-auto` on a child to push the rest of
   * the group to the right.
   */
  actions?: ReactNode;
  /**
   * Let the box be sent while its text is empty. Set it when the message
   * carries something else — an attached image, say. Without it an attachment
   * can be picked and previewed but never sent, because emptiness is measured
   * on the text alone.
   */
  allowEmptySubmit?: boolean;
  /**
   * Hands out a setter for the box's content. Use it to put a draft back —
   * restoring a message taken back for correction, for instance. The editor
   * reads its `value` once, so this is the only way to write to it later.
   */
  bindSetValue?: (setValue: (text: string) => void) => void;
  onStop?: () => void;
  /**
   * Adds a mic button beside send that types what is said at the caret. Uses
   * the browser's speech recognizer, so the button only appears where one
   * exists (Chromium, Safari); `true` listens in the document's language.
   */
  dictation?: boolean | ComposerDictation;
  /**
   * "@" opens a menu of these people; picking one inserts "@Name". With
   * `createLabel`, a single word nobody matches gets a last "create" option
   * that inserts it too — the composer creates nothing, the host reads the
   * name out of the submitted text.
   */
  mentions?: {
    people: MentionData[];
    createLabel?: (name: string) => string;
  };
  /** Earlier messages, newest first — Arrow Up walks back through them. */
  history?: string[];
  /**
   * The formatting bar that floats over selected text. Off by default, as in
   * Claude's chat box — markdown shortcuts and Cmd+B still format. The bar
   * lives inside the box's scroll container, so at one or two lines tall it
   * was cut off. (The Editor itself keeps it on by default.)
   */
  formatToolbar?: boolean;
  autoFocus?: boolean;
  className?: string;
  classNames?: {
    /**
     * The editor's scroll container — where height lives. Give the box a
     * starting height (`min-h-*`) or a different cap (`max-h-*`) here. Padding
     * belongs to the content, not this.
     */
    editor?: string;
  };
};

export function Composer({
  format = "markdown",
  placeholder = "Send a message...",
  onSubmit,
  busy = false,
  attachments,
  leading,
  size = "middle",
  actions,
  allowEmptySubmit = false,
  bindSetValue,
  onStop,
  dictation,
  mentions,
  history,
  formatToolbar = false,
  autoFocus = false,
  className,
  classNames,
}: ComposerProps) {
  const [isEmpty, setIsEmpty] = useState(true);
  const submitReference = useRef<(() => void) | null>(null);
  const insertTextReference = useRef<((text: string) => void) | null>(null);

  const bindSubmit = useCallback((submit: () => void) => {
    submitReference.current = submit;
  }, []);

  const bindInsertText = useCallback((insertText: (text: string) => void) => {
    insertTextReference.current = insertText;
  }, []);

  const insertTranscript = useCallback((text: string) => {
    insertTextReference.current?.(text);
  }, []);
  const dictationOptions = typeof dictation === "object" ? dictation : {};
  const speech = useDictation({
    lang: dictationOptions.lang,
    onError: dictationOptions.onError,
    onFinal: insertTranscript,
  });
  const showMic = Boolean(dictation) && speech.supported;
  const isSmall = size === "small";
  const buttonSize = isSmall ? "icon-xs" : "icon-sm";

  // Sending ends the take: a mic left open would start filling the next
  // message with whatever is said while reading the reply.
  const { listening, stop: stopDictation } = speech;
  const handleSubmit = useCallback(
    (value: string) => {
      if (listening) stopDictation();
      onSubmit(value);
    },
    [listening, onSubmit, stopDictation],
  );

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
          {leading && (
            <div
              data-slot="composer-leading"
              className={cn(
                "flex shrink-0 items-center",
                // Same last-line centring as the send button, see below.
                "pb-[4.5px]",
                isSmall ? "pl-1.5" : "pl-2",
              )}
            >
              {leading}
            </div>
          )}
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
              className={cn("max-h-64 min-h-0 sm:min-h-0", classNames?.editor)}
              classNames={{
                content: cn(
                  isSmall ? "px-2.5 py-1.5" : "px-3 py-2.5",
                  // The editor spaces blocks like a document (0.375em above
                  // and below). Inside a box that pushed a one-line message
                  // up off the buttons' line; keep the spacing between blocks,
                  // drop it at the edges.
                  "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
                  // The leading control already holds the left edge.
                  leading && (isSmall ? "pl-1.5" : "pl-2"),
                  // iOS Safari zooms the page in when a focused field's text
                  // is under 16px, and the editor draws 14px. On touch the
                  // box types at 16px instead — the fix Input's own text
                  // takes — rather than locking the viewport's zoom, which
                  // would take pinch-zoom away from everyone.
                  "any-pointer-coarse:text-base",
                ),
                // One line: a long hint wrapped under a one-line box and was
                // cut in half at its bottom edge.
                placeholder: "[&>div]:my-0 [&>div]:truncate",
              }}
              format={format as "markdown"}
              onStatsChange={handleStatsChange}
              placeholder={placeholder}
              variant="minimal"
              formatToolbar={formatToolbar}
              mentionsData={mentions?.people}
              createMentionLabel={mentions?.createLabel}
            >
              <ComposerSubmitPlugin
                allowEmpty={allowEmptySubmit}
                bindInsertText={bindInsertText}
                bindSetValue={bindSetValue}
                bindSubmit={bindSubmit}
                history={history}
                disabled={busy}
                format={format}
                onSubmit={handleSubmit}
              />
            </Editor>
          </div>

          <div
            className={cn(
              "flex shrink-0 items-center gap-0.5",
              // Centred on the last line of text: its middle sits the content
              // padding plus half a 21px line above the bottom (16.5px small,
              // 20.5px middle), minus half the 24px / 32px button.
              isSmall ? "pr-1.5 pb-[4.5px]" : "pr-2 pb-[4.5px]",
            )}
          >
            {showMic && (
              <InputGroupButton
                aria-label={
                  speech.listening ? "Stop dictation" : "Start dictation"
                }
                aria-pressed={speech.listening}
                // Keep the caret where it is: the transcript goes there.
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  if (speech.listening) speech.stop();
                  else speech.start();
                }}
                size={buttonSize}
                variant="ghost"
                className={cn(
                  speech.listening && "text-destructive animate-pulse",
                )}
              >
                <MicIcon />
              </InputGroupButton>
            )}
            <InputGroupButton
              aria-label={busy ? "Stop generating" : "Send message"}
              disabled={busy ? !onStop : isEmpty && !allowEmptySubmit}
              onClick={() => {
                if (busy) {
                  onStop?.();
                  return;
                }

                submitReference.current?.();
              }}
              size={buttonSize}
              variant="ghost"
            >
              {busy ? (
                <SquareIcon className="size-3 fill-current" />
              ) : (
                <SendHorizontalIcon />
              )}
            </InputGroupButton>
          </div>
        </div>

        {/* What the recognizer has heard but not settled on yet. Shown, not
            typed: it is still being revised. */}
        {speech.listening && speech.interim && (
          <p
            aria-live="polite"
            data-slot="composer-dictation-interim"
            className="text-muted-foreground truncate px-3 pb-2 text-sm italic"
          >
            {speech.interim}
          </p>
        )}
      </InputGroup>

      {actions && (
        <div className="text-muted-foreground flex items-center gap-1 px-1 text-sm">
          {actions}
        </div>
      )}
    </div>
  );
}
