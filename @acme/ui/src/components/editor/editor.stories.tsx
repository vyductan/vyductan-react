import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor, within } from "storybook/test";

import { Editor } from "./editor";
import PlaygroundDemo from "./examples/playground";

const meta = {
  title: "Components/Editor",
  component: Editor,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    placeholder: {
      control: "text",
      description: "Placeholder text for the editor",
    },
    value: {
      control: "text",
      description: "Initial editor state as JSON string",
    },
  },
} satisfies Meta<typeof Editor>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic editor with no initial content
export const Default: Story = {
  args: {
    onChange: fn(),
  },
};

// Editor with placeholder
export const WithPlaceholder: Story = {
  args: {
    placeholder: "Enter your text here...",
    onChange: fn(),
  },
};

// Interactive editor with state management
export const Interactive: Story = {
  render: (arguments_) => {
    const [editorContent, setEditorContent] = useState<string>("");

    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-gray-200">
          <Editor
            {...arguments_}
            onChange={(jsonString) => {
              setEditorContent(jsonString);
            }}
          />
        </div>
        <div className="space-y-2">
          <div className="text-sm font-semibold">Editor State (JSON):</div>
          <pre className="max-h-48 overflow-auto rounded bg-gray-100 p-3 text-xs">
            {editorContent || "No content yet"}
          </pre>
        </div>
      </div>
    );
  },
  args: {
    placeholder: "Type something to see the editor state...",
  },
};

// Editor with styled container
export const StyledContainer: Story = {
  render: (arguments_) => {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-xl border-2 border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Rich Text Editor
            </h3>
            <p className="text-sm text-gray-600">
              Create beautiful content with our editor
            </p>
          </div>
          <div className="p-6">
            <Editor {...arguments_} />
          </div>
        </div>
      </div>
    );
  },
  args: {
    placeholder: "Start writing your masterpiece...",
    onChange: fn(),
  },
};

export const Playground: Story = {
  render: () => <PlaygroundDemo />,
};

const VARIANTS = [
  {
    variant: "default",
    title: "default",
    blurb:
      "The full document surface: slash commands, a drag handle on every block, and every embed — images, video, files, polls, layouts, equations, Excalidraw. Formatting comes from a toolbar that floats over the selection.",
  },
  {
    variant: "simple",
    title: "simple",
    blurb:
      "Trades the floating toolbar for a fixed one at the top and drops the document-level extras. Images still work. Suited to a form field whose controls have to be visible before the user selects anything.",
  },
  {
    variant: "minimal",
    title: "minimal",
    blurb:
      "No toolbar of its own beyond the floating one, and no images. Rich text down to what typing produces — markdown shortcuts, links, mentions, emoji. This is what Composer builds on.",
  },
] as const;

/**
 * The three surfaces side by side. What separates them is which plugins mount,
 * so the differences are behavioural rather than cosmetic and are easiest to
 * judge by typing in each one.
 */
export const Variants: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 p-6">
      {VARIANTS.map(({ variant, title, blurb }) => (
        <section
          className="flex flex-col gap-2"
          data-variant={variant}
          key={variant}
        >
          <header>
            <h3 className="font-mono text-sm font-semibold">{title}</h3>
            <p className="text-muted-foreground text-sm">{blurb}</p>
          </header>

          <div className="rounded-md border">
            {/*
              Padding is left at the default on purpose: `default` positions a
              drag handle in the left gutter, so narrowing it puts the handle on
              top of the first characters.
            */}
            <Editor
              placeholder={`Type here — this is the ${title} editor…`}
              variant={variant}
            />
          </div>
        </section>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Counted by contenteditable rather than by role: the toolbars contribute
    // textboxes of their own, so the role count is not the editor count.
    await waitFor(() => {
      expect(
        canvasElement.querySelectorAll('[contenteditable="true"]'),
      ).toHaveLength(VARIANTS.length);
    });

    const panelFor = (variant: string) => {
      const node = canvasElement.querySelector<HTMLElement>(
        `[data-variant="${variant}"]`,
      );
      if (!node) throw new Error(`no panel for ${variant}`);
      return node;
    };

    // The block-type dropdown belongs to the fixed toolbar, which only `simple`
    // mounts — the cheapest observable proof that the variant prop reached the
    // plugin list rather than being quietly ignored.
    await waitFor(() => {
      expect(within(panelFor("simple")).getByRole("combobox")).toBeVisible();
    });

    expect(within(panelFor("default")).queryByRole("combobox")).toBeNull();
    expect(within(panelFor("minimal")).queryByRole("combobox")).toBeNull();
  },
};
