import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { fn } from "storybook/test";

import { Editor } from "./editor";

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
  tags: ["autodocs"],
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
  render: (args) => {
    const [editorContent, setEditorContent] = useState<string>("");

    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-gray-200">
          <Editor
            {...args}
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
  render: (args) => {
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
            <Editor {...args} />
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

// Markdown Editor Stories
const markdownMeta = {
  title: "Components/Editor/With Markdown",
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
  tags: ["autodocs"],
} satisfies Meta<typeof Editor>;

type MarkdownStory = StoryObj<typeof markdownMeta>;

// Basic markdown editor
export const MarkdownDefault: MarkdownStory = {
  args: {
    value: "",
    placeholder: "Start typing in markdown...",

    onChange: fn(),
    mode: "markdown",
  },
  render: (args) => <Editor {...args} mode="markdown" />,
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
    mode: "markdown",
  },
  render: (args) => <Editor {...args} mode="markdown" />,
};

// Interactive markdown editor with state
export const MarkdownInteractive: MarkdownStory = {
  render: (args) => {
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
            {...args}
            mode="markdown"
            value={markdown}
            onChange={(markdown) => setMarkdown(markdown)}
            onStatsChange={setStats}
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
  args: {
    value: "",
    placeholder: "Type something...",
    onChange: fn(),
    mode: "markdown",
  },
};

// Markdown editor with sync demonstration
export const MarkdownSync: MarkdownStory = {
  render: (args) => {
    const [markdown, setMarkdown] = useState(
      String.raw`# Hello World\n\nThis is a test.`,
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
              {...args}
              mode="markdown"
              value={markdown}
              onChange={(markdown) => setMarkdown(markdown)}
            />
          </div>
        </div>
      </div>
    );
  },
  args: {
    value: String.raw`# Hello World\n\nThis is a test.`,
    placeholder: "Type something...",
    onChange: fn(),
    mode: "markdown",
  },
};

// Markdown editor with full features
export const MarkdownFullFeatures: MarkdownStory = {
  render: (args) => {
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
              {...args}
              mode="markdown"
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
    mode: "markdown",
  },
};

export const MarkdownEditorMeta = markdownMeta;
