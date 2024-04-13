"use client";

import type { ComponentProps } from "react";
import { memo } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

import { useCopyToClipboard } from "@acme/hooks";

import { Button } from "../button";
import { Icon } from "../icons";

export const programmingLanguages = {
  javascript: ".js",
  python: ".py",
  java: ".java",
  c: ".c",
  cpp: ".cpp",
  "c++": ".cpp",
  "c#": ".cs",
  ruby: ".rb",
  php: ".php",
  swift: ".swift",
  "objective-c": ".m",
  kotlin: ".kt",
  typescript: ".ts",
  go: ".go",
  perl: ".pl",
  rust: ".rs",
  scala: ".scala",
  haskell: ".hs",
  lua: ".lua",
  shell: ".sh",
  sql: ".sql",
  html: ".html",
  css: ".css",
  // add more file extensions here, make sure the key is same as language prop in CodeBlock.tsx component
};

export type CodeBlockProps = Omit<
  ComponentProps<typeof SyntaxHighlighter>,
  "language" | "children"
> & {
  language?: keyof typeof programmingLanguages;
  children: string;
};
export const CodeBlock = memo(
  ({ language, children, ...props }: CodeBlockProps) => {
    const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });
    const onCopy = () => {
      if (isCopied) return;
      copyToClipboard(children);
    };
    return (
      <div className="relative w-full bg-zinc-950 font-sans">
        <div className="flex w-full items-center justify-between bg-zinc-800 px-6 py-2 pr-4 text-zinc-100">
          <span className="text-xs lowercase">{language}</span>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              className="text-xs hover:bg-zinc-800 focus-visible:ring-1 focus-visible:ring-slate-700 focus-visible:ring-offset-0"
              onClick={onCopy}
            >
              {isCopied ? (
                <Icon icon="lucide:clipboard-check" />
              ) : (
                <Icon icon="mingcute:copy-line" />
              )}
              <span className="sr-only">Copy code</span>
            </Button>
          </div>
        </div>
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          showLineNumbers
          customStyle={{
            margin: 0,
            width: "100%",
            background: "transparent",
            padding: "1.5rem 1rem",
          }}
          codeTagProps={{
            style: {
              fontSize: "0.9rem",
              fontFamily: "var(--font-mono)",
            },
          }}
          {...props}
        >
          {children}
        </SyntaxHighlighter>
      </div>
    );
  },
);
CodeBlock.displayName = "CodeBlock";
