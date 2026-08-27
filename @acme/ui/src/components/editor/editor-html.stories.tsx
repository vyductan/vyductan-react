import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";

import { Editor } from "./editor";

/**
 * Split out for the same reason as the markdown stories: this meta sat beside the
 * default export in editor.stories.tsx and therefore never applied.
 */
const htmlMeta = {
  title: "Components/Editor/HTML Format",
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
      description: "HTML content",
    },
  },
} satisfies Meta<typeof Editor>;

export default htmlMeta;
type HtmlStory = StoryObj<typeof htmlMeta>;

export const HtmlDefault: HtmlStory = {
  args: {
    value: "",
    placeholder: "Start typing in html...",
    onChange: fn(),
    format: "html",
  },
  render: (arguments_) => <Editor {...arguments_} format="html" />,
};

export const HtmlWithContent: HtmlStory = {
  args: {
    value: `<h1>Welcome to the Editor</h1><p>This is a <b>rich text editor</b> with <i>HTML</i> support.</p><ul><li>Easy to use</li><li>HTML compatible</li><li>Rich formatting options</li></ul><p>Try editing this content!</p>`,
    placeholder: "Start typing...",
    onChange: fn(),
    format: "html",
  },
  render: (arguments_) => <Editor {...arguments_} format="html" />,
};

export const HtmlInteractive: HtmlStory = {
  render: () => {
    const [html, setHtml] = useState(
      `<h1>Interactive Editor</h1><p>Edit this content and see the HTML output below.</p><p><b>Bold text</b> and <i>italic text</i> are supported.</p>`,
    );

    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-gray-200">
          <Editor
            format="html"
            value={html}
            onChange={(html) => setHtml(html)}
            placeholder="Type something..."
          />
        </div>
        <div className="space-y-2">
          <div className="text-sm font-semibold">HTML Output:</div>
          <pre className="max-h-48 overflow-auto rounded bg-gray-100 p-3 text-xs whitespace-pre-wrap">
            {html || "No content yet"}
          </pre>
        </div>
      </div>
    );
  },
};
