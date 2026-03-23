import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CodeBlock } from "./code-block";

const languageOptions = ["typescript", "bash", "json", "text"] as const;

const typescriptSnippet = `import { CodeBlock } from "@acme/ui/components/code-block";

export function Example() {
  return (
    <CodeBlock language="typescript">
      {"const total = items.reduce((sum, item) => sum + item.price, 0);"}
    </CodeBlock>
  );
}`;

const shellSnippet = `pnpm install
pnpm -F @acme/ui storybook
pnpm -F @acme/ui test -- --runInBand`;

const plainTextSnippet = `Build completed successfully.
3 stories rendered.
No syntax highlighting requested.`;

const meta = {
  title: "Components/CodeBlock",
  component: CodeBlock,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    language: {
      control: "select",
      options: languageOptions,
    },
    children: {
      control: "text",
    },
  },
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    language: "tsx",
    children: typescriptSnippet,
  },
};

export const TypeScript: Story = {
  render: (args) => <CodeBlock {...args} />,
  args: {
    language: "typescript",
    children: `type User = {
  id: string;
  email: string;
};

export function getDisplayName(user: User) {
  return user.email.split("@")[0];
}`,
  },
};

export const Shell: Story = {
  args: {
    language: "bash",
    children: shellSnippet,
  },
};

export const PlainTextFallback: Story = {
  args: {
    language: "text",
    children: plainTextSnippet,
  },
};
