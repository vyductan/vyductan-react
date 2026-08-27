import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";

import { Editor } from "./editor";

/**
 * These were declared against a second meta object inside editor.stories.tsx that
 * was never the file's default export, so Storybook ignored its title and filed
 * all five stories flat under Components/Editor — beside the real subfolders.
 * A meta only takes effect as a file's default export, hence the split; it
 * matches how modal.affordance.stories.tsx already does this.
 */
const markdownMeta = {
  title: "Components/Editor/Markdown Format",
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
      description: "Markdown content",
    },
  },
} satisfies Meta<typeof Editor>;

export default markdownMeta;
type MarkdownStory = StoryObj<typeof markdownMeta>;

// Basic markdown editor
export const MarkdownDefault: MarkdownStory = {
  args: {
    value: "",
    placeholder: "Start typing in markdown...",

    onChange: fn(),
    format: "markdown",
  },
  render: (arguments_) => <Editor {...arguments_} format="markdown" />,
};

// Markdown editor with initial content
export const MarkdownWithContent: MarkdownStory = {
  args: {
    value: `# Welcome to the Editor

This is a **rich text editor** with *markdown* support.

## Features

- Easy to use
- Markdown compatible
- Rich formatting options

\`\`\`javascript
const hello = "world";
console.log(hello);
\`\`\`

Try editing this content!`,
    placeholder: "Start typing...",

    onChange: fn(),
    format: "markdown",
  },
  render: (arguments_) => <Editor {...arguments_} format="markdown" />,
};

// Interactive markdown editor with state
export const MarkdownInteractive: MarkdownStory = {
  render: () => {
    const [markdown, setMarkdown] = useState(
      `# Interactive Editor

Edit this content and see the markdown output below.

**Bold text** and *italic text* are supported.`,
    );
    const [stats, setStats] = useState({
      wordCount: 0,
      characterCount: 0,
      readingTimeMinutes: 0,
    });

    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-gray-200">
          <Editor
            format="markdown"
            value={markdown}
            onChange={(markdown) => setMarkdown(markdown)}
            onStatsChange={setStats}
            placeholder="Type something..."
          />
        </div>
        <div className="space-y-2">
          <div className="flex gap-4 text-sm text-gray-600">
            <span>Words: {stats.wordCount}</span>
            <span>Characters: {stats.characterCount}</span>
            <span>Reading time: {stats.readingTimeMinutes} min</span>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-semibold">Markdown Output:</div>
            <pre className="max-h-48 overflow-auto rounded bg-gray-100 p-3 text-xs">
              {markdown || "No content yet"}
            </pre>
          </div>
        </div>
      </div>
    );
  },
};

// Markdown editor with sync demonstration
export const MarkdownSync: MarkdownStory = {
  render: (arguments_) => {
    const [markdown, setMarkdown] = useState(
      `# Hello World

This is a test.`,
    );

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm font-semibold">Edit markdown directly:</div>
          <textarea
            className="w-full rounded border border-gray-300 p-3 font-mono text-sm"
            rows={6}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Enter markdown here..."
          />
        </div>
        <div className="space-y-2">
          <div className="text-sm font-semibold">Preview:</div>
          <div className="rounded border border-gray-200">
            <Editor
              {...arguments_}
              format="markdown"
              value={markdown}
              onChange={(markdown) => setMarkdown(markdown)}
            />
          </div>
        </div>
      </div>
    );
  },
  args: {
    value: `# Hello World

This is a test.`,
    placeholder: "Type something...",
    onChange: fn(),
    format: "markdown",
  },
};

// Markdown editor with full features
export const MarkdownFullFeatures: MarkdownStory = {
  render: (arguments_) => {
    const [markdown, setMarkdown] = useState(
      `# Full Featured Editor

## Rich Text Features

This editor supports:

1. **Headings** (H1 through H6)
2. **Lists** (ordered and unordered)
3. **Bold** and *italic* text
4. \`Inline code\`
5. Links and more!

### Code Blocks

\`\`\`typescript
interface User {
  name: string;
  age: number;
}
\`\`\`

### Blockquotes

> This is a blockquote.
> It can span multiple lines.

Try editing to see all features in action!`,
    );

    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-xl border-2 border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Markdown Editor
            </h3>
            <p className="text-sm text-gray-600">
              Full-featured editor with markdown support
            </p>
          </div>
          <div className="p-6">
            <Editor
              {...arguments_}
              format="markdown"
              value={markdown}
              onChange={(markdown) => setMarkdown(markdown)}
            />
          </div>
        </div>
      </div>
    );
  },
  args: {
    value: "",
    placeholder: "Start typing...",
    onChange: fn(),
    format: "markdown",
  },
};
