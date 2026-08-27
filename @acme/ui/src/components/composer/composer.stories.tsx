import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { ImageIcon, PaperclipIcon, XIcon } from "lucide-react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { InputGroupButton } from "@acme/ui/components/input-group";

import { Composer } from "./composer";

const meta = {
  title: "Components/Composer",
  component: Composer,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof Composer>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Targets the placeholder element rather than its text. Asserting on the string
 * was a false green twice over: when the bug was live the placeholder stayed
 * visible but swapped its text to the block name, so a `queryByText` for the
 * original wording came back empty either way.
 */
function placeholderOf(canvasElement: HTMLElement) {
  return canvasElement.querySelector('[data-slot="editor-placeholder"]');
}

function editableOf(canvasElement: HTMLElement) {
  const editable = canvasElement.querySelector<HTMLElement>(
    '[data-lexical-editor="true"]',
  );

  if (!editable) {
    throw new Error("Expected the composer to render");
  }

  return editable;
}

/**
 * Clicking is not enough to start typing: Lexical installs its selection from an
 * effect, so keystrokes fired in the same tick land nowhere. Without the focus
 * wait these stories pass alone and drop their first characters under a full
 * suite run.
 */
async function focusComposer(canvasElement: HTMLElement) {
  const editable = editableOf(canvasElement);

  await userEvent.click(editable);
  await waitFor(() => {
    expect(editable).toHaveFocus();
  });

  return editable;
}

export const Default: Story = {
  args: {
    onSubmit: fn(),
  },
};

export const Busy: Story = {
  args: {
    busy: true,
    onStop: fn(),
    onSubmit: fn(),
  },
};

/** A transcript-style harness, which is how this is meant to be used. */
export const WithTranscript: Story = {
  args: { onSubmit: fn() },
  render: (arguments_) => {
    const [sent, setSent] = React.useState<string[]>([]);

    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <div className="space-y-2">
          {sent.map((message, index) => (
            <pre
              key={index}
              className="bg-muted rounded-md p-3 text-sm whitespace-pre-wrap"
            >
              {message}
            </pre>
          ))}
        </div>
        <Composer
          {...arguments_}
          onSubmit={(value) => {
            setSent((previous) => [...previous, value]);
            arguments_.onSubmit(value);
          }}
        />
      </div>
    );
  },
};

export const SendsOnEnterAndClears: Story = {
  args: { onSubmit: fn() },
  play: async ({ args, canvasElement }) => {
    const editable = await focusComposer(canvasElement);

    await userEvent.keyboard("hello there");

    await waitFor(() => {
      expect(editable).toHaveTextContent("hello there");
    });

    await userEvent.keyboard("{Enter}");

    await waitFor(() => {
      expect(args.onSubmit).toHaveBeenCalledWith("hello there");
    });

    // Clearing matters as much as sending: a leftover draft would be prefixed to
    // the next message.
    await waitFor(() => {
      expect(editable.textContent?.trim()).toBe("");
    });
  },
};

/**
 * Clearing by emptying the root leaves Lexical with no block and the selection
 * anchored on the root itself, which throws out of every plugin that resolves a
 * selection to its top-level element. The composer has to hand back a document
 * that is empty *and* writable.
 */
export const KeepsWritableAfterSending: Story = {
  args: { onSubmit: fn() },
  play: async ({ args, canvasElement }) => {
    const editable = await focusComposer(canvasElement);

    await userEvent.keyboard("first");
    await userEvent.keyboard("{Enter}");

    await waitFor(() => {
      expect(args.onSubmit).toHaveBeenCalledWith("first");
    });

    // An empty root is not the same as an empty paragraph: only the latter can
    // hold a caret.
    await waitFor(() => {
      expect(editable.querySelector("p")).not.toBeNull();
    });

    await userEvent.keyboard("second");

    await waitFor(() => {
      expect(editable).toHaveTextContent("second");
    });

    await userEvent.keyboard("{Enter}");

    await waitFor(() => {
      expect(args.onSubmit).toHaveBeenLastCalledWith("second");
    });
  },
};

/**
 * Lexical writes an empty paragraph as `<p><br></p>`, so an html composer's
 * "is there anything to send" check cannot be a trim on the serialized value —
 * that string is 12 characters of nothing.
 */
export const HtmlFormatDoesNotSendAnEmptyParagraph: Story = {
  args: { format: "html", onSubmit: fn() },
  play: async ({ args, canvasElement }) => {
    const editable = await focusComposer(canvasElement);

    // Typed then removed, so the editor is empty by content but has been touched.
    await userEvent.keyboard("x");

    await waitFor(() => {
      expect(editable).toHaveTextContent("x");
    });

    await userEvent.keyboard("{Backspace}");

    await waitFor(() => {
      expect(editable.textContent?.trim()).toBe("");
    });

    await userEvent.keyboard("{Enter}");

    // Give a send the chance to land before concluding none happened.
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(args.onSubmit).not.toHaveBeenCalled();

    // Proves the silence above is the emptiness check and not a dead Enter key:
    // the same keystroke sends as soon as there is content, and what it sends
    // shows exactly how an empty document would have serialized.
    await userEvent.keyboard("y");

    await waitFor(() => {
      expect(editable).toHaveTextContent("y");
    });

    await userEvent.keyboard("{Enter}");

    await waitFor(() => {
      expect(args.onSubmit).toHaveBeenCalledTimes(1);
    });

    expect(args.onSubmit).toHaveBeenCalledWith("<p>y</p>");
  },
};

export const ShiftEnterAddsALineInstead: Story = {
  args: { onSubmit: fn() },
  play: async ({ args, canvasElement }) => {
    const editable = await focusComposer(canvasElement);

    await userEvent.keyboard("first");
    await userEvent.keyboard("{Shift>}{Enter}{/Shift}");
    await userEvent.keyboard("second");

    await waitFor(() => {
      expect(editable).toHaveTextContent("second");
    });

    expect(args.onSubmit).not.toHaveBeenCalled();
    expect(editable).toHaveTextContent("first");
  },
};

/** The case from the design: typing `1. ` has to produce a real list. */
export const MarkdownShortcutsStillWork: Story = {
  args: { onSubmit: fn() },
  play: async ({ args, canvasElement }) => {
    const editable = await focusComposer(canvasElement);

    await userEvent.keyboard("1. number");
    await userEvent.keyboard("{Shift>}{Enter}{/Shift}");
    await userEvent.keyboard("string");

    await waitFor(() => {
      expect(editable.querySelector("ol")).toBeTruthy();
    });

    await userEvent.keyboard("{Enter}");

    await waitFor(() => {
      expect(args.onSubmit).toHaveBeenCalled();
    });

    // Markdown out, so the list survives as a list for whatever reads it.
    const calls = (args.onSubmit as ReturnType<typeof fn>).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    expect(String(calls[0]?.[0])).toContain("number");
  },
};

export const SendIsDisabledWhileEmpty: Story = {
  args: { onSubmit: fn() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const send = canvas.getByRole("button", { name: "Send message" });

    expect(send).toBeDisabled();

    await focusComposer(canvasElement);
    await userEvent.keyboard("now it has content");

    await waitFor(() => {
      expect(send).toBeEnabled();
    });
  },
};

export const StopReplacesSendWhileBusy: Story = {
  args: { busy: true, onStop: fn(), onSubmit: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    const stop = canvas.getByRole("button", { name: "Stop generating" });
    await userEvent.click(stop);

    expect(args.onStop).toHaveBeenCalled();

    // Enter must not send behind a streaming reply.
    await focusComposer(canvasElement);
    await userEvent.keyboard("queued{Enter}");

    expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

/**
 * Sends without waiting for anything in between. `Editor` loads its markdown and
 * html plugins lazily while accepting typing immediately, so an Enter in that
 * window used to submit an empty string and wipe the draft. Reading the value
 * from the editor rather than from `onChange` is what closed it, and this is the
 * story that fails if that regresses.
 */
export const SendsBeforeLazyPluginsSettle: Story = {
  args: { onSubmit: fn() },
  play: async ({ args, canvasElement }) => {
    await focusComposer(canvasElement);
    await userEvent.keyboard("urgent{Enter}");

    await waitFor(() => {
      expect(args.onSubmit).toHaveBeenCalledWith("urgent");
    });
  },
};

/**
 * The editor's own default is a document min-height — 300px, 400px from `sm`.
 * Left alone, an empty composer stood half a screen tall, so this pins the
 * collapsed height and the growth ceiling.
 */
export const StaysCompactUntilItGrows: Story = {
  args: { onSubmit: fn() },
  play: async ({ canvasElement }) => {
    const group = canvasElement.querySelector<HTMLElement>(
      '[data-slot="input-group"]',
    );

    if (!group) {
      throw new Error("Expected the composer shell to render");
    }

    await waitFor(() => {
      expect(editableOf(canvasElement)).toBeTruthy();
    });

    const emptyHeight = group.getBoundingClientRect().height;
    expect(emptyHeight).toBeLessThan(160);

    await focusComposer(canvasElement);
    for (let line = 0; line < 12; line += 1) {
      await userEvent.keyboard(`line ${line}{Shift>}{Enter}{/Shift}`);
    }

    await waitFor(() => {
      expect(group.getBoundingClientRect().height).toBeGreaterThan(emptyHeight);
    });

    // Grows, but stops: past the ceiling the content scrolls instead.
    expect(group.getBoundingClientRect().height).toBeLessThan(400);
  },
};

/**
 * The placeholder has to disappear the moment a block exists, not just when text
 * does. Typing `1. ` leaves a list whose only item is still empty, and an
 * emptiness rule that looked at text alone kept the placeholder painted over it.
 */
export const PlaceholderClearsOnceABlockExists: Story = {
  args: { onSubmit: fn(), placeholder: "Ask anything..." },
  play: async ({ canvasElement }) => {
    expect(placeholderOf(canvasElement)).toHaveTextContent("Ask anything...");

    await focusComposer(canvasElement);
    await userEvent.keyboard("1. ");

    await waitFor(() => {
      expect(editableOf(canvasElement).querySelector("ol")).toBeTruthy();
    });

    expect(placeholderOf(canvasElement)).toBeNull();
  },
};

export const PlaceholderReturnsWhenEmptiedAgain: Story = {
  args: { onSubmit: fn(), placeholder: "Ask anything..." },
  play: async ({ canvasElement }) => {
    await focusComposer(canvasElement);
    await userEvent.keyboard("hello");

    await waitFor(() => {
      expect(placeholderOf(canvasElement)).toBeNull();
    });

    await userEvent.keyboard("{Backspace>5/}");

    await waitFor(() => {
      expect(placeholderOf(canvasElement)).toHaveTextContent("Ask anything...");
    });
  },
};

function AttachmentChip({
  name,
  onRemove,
}: {
  name: string;
  onRemove: () => void;
}) {
  return (
    <span className="bg-muted text-foreground relative flex items-center gap-2 rounded-md px-2 py-1 text-xs">
      {name}
      <button
        aria-label={`Remove ${name}`}
        className="text-muted-foreground hover:text-foreground"
        onClick={onRemove}
        type="button"
      >
        <XIcon className="size-3" />
      </button>
    </span>
  );
}

/**
 * Attachments preview inside the box, above the text — that is what is about to
 * be sent. The pickers themselves sit in `actions`, outside the border, together
 * with anything else that configures the message rather than being part of it.
 */
export const WithAttachmentsAndActions: Story = {
  args: { onSubmit: fn() },
  render: (arguments_) => {
    const [attached, setAttached] = React.useState<string[]>(["image.png"]);

    return (
      <div className="mx-auto max-w-2xl">
        <Composer
          {...arguments_}
          actions={
            <>
              <InputGroupButton
                aria-label="Attach a file"
                onClick={() => setAttached((p) => [...p, "quote.pdf"])}
                size="icon-sm"
                variant="ghost"
              >
                <PaperclipIcon />
              </InputGroupButton>
              <InputGroupButton
                aria-label="Attach an image"
                onClick={() => setAttached((p) => [...p, "screenshot.png"])}
                size="icon-sm"
                variant="ghost"
              >
                <ImageIcon />
              </InputGroupButton>
              {/* `ml-auto` is how the row splits into a left and a right group. */}
              <span className="ml-auto text-xs">Opus 5</span>
            </>
          }
          attachments={
            attached.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {attached.map((name, index) => (
                  <AttachmentChip
                    key={`${name}-${index}`}
                    name={name}
                    onRemove={() =>
                      setAttached((p) => p.filter((_, i) => i !== index))
                    }
                  />
                ))}
              </div>
            ) : null
          }
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvasElement.querySelector<HTMLElement>(
      '[data-slot="input-group"]',
    );

    if (!group) {
      throw new Error("Expected the composer shell to render");
    }

    // Previews belong inside the border; the pickers belong outside it.
    expect(group.contains(canvas.getByText("image.png"))).toBe(true);
    expect(
      group.contains(canvas.getByRole("button", { name: "Attach a file" })),
    ).toBe(false);

    await userEvent.click(
      canvas.getByRole("button", { name: "Attach a file" }),
    );

    await waitFor(() => {
      expect(canvas.getByText("quote.pdf")).toBeTruthy();
    });

    await userEvent.click(
      canvas.getByRole("button", { name: "Remove quote.pdf" }),
    );

    await waitFor(() => {
      expect(canvas.queryByText("quote.pdf")).toBeNull();
    });

    // Adding actions must not displace send.
    expect(canvas.getByRole("button", { name: "Send message" })).toBeDisabled();
  },
};

/**
 * `Editor` forwards its `className` to an inner scroll container, not to the
 * element it renders into the composer's flex row. A `flex-1` handed to `Editor`
 * therefore lands one level too deep and the typing area collapses to the width
 * of its own text, dragging send in beside the caret.
 */
export const EditorFillsTheRow: Story = {
  args: { onSubmit: fn() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvasElement.querySelector('[data-slot="input-group"]');
    const editable = await focusComposer(canvasElement);
    const send = canvas.getByRole("button", { name: "Send message" });

    if (!group) {
      throw new Error("Expected the composer shell to render");
    }

    await userEvent.keyboard("hi");

    await waitFor(() => {
      expect(editable).toHaveTextContent("hi");
    });

    const groupBox = group.getBoundingClientRect();
    const editableBox = editable.getBoundingClientRect();
    const sendBox = send.getBoundingClientRect();

    // Short text must not shrink the typing area: it owns the row minus send.
    expect(editableBox.width).toBeGreaterThan(groupBox.width * 0.8);

    // And send stays pinned to the trailing edge rather than following the text.
    expect(groupBox.right - sendBox.right).toBeLessThan(24);
  },
};

/**
 * The send button rides the last line of the message. A block-end addon would
 * give it a row of its own under the text, which is the layout this replaced.
 */
export const SendRidesTheLastLine: Story = {
  args: { onSubmit: fn() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const send = canvas.getByRole("button", { name: "Send message" });
    const editable = await focusComposer(canvasElement);

    await userEvent.keyboard("one{Shift>}{Enter}{/Shift}two");

    await waitFor(() => {
      expect(editable).toHaveTextContent("two");
    });

    const sendBox = send.getBoundingClientRect();
    const editorBox = editable.getBoundingClientRect();

    // Bottom-aligned with the text rather than parked in a strip beneath it.
    expect(Math.abs(sendBox.bottom - editorBox.bottom)).toBeLessThan(24);

    // And still beside the text, not under it.
    expect(sendBox.top).toBeLessThan(editorBox.bottom);
  },
};
