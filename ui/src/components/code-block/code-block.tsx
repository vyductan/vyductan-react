"use client";

import type { ComponentProps } from "react";
import type {
  BundledLanguage,
  SpecialLanguage,
  StringLiteralUnion,
} from "shiki/bundle/web";
import { memo, useEffect, useMemo, useState } from "react";
import { codeToHtml } from "shiki/bundle/web";
import { useCopyToClipboard } from "usehooks-ts";

import { Icon } from "../../icons";
import { Button } from "../button";

// export const programmingLanguages = {
//   javascript: ".js",
//   python: ".py",
//   java: ".java",
//   c: ".c",
//   cpp: ".cpp",
//   "c++": ".cpp",
//   "c#": ".cs",
//   ruby: ".rb",
//   php: ".php",
//   swift: ".swift",
//   "objective-c": ".m",
//   kotlin: ".kt",
//   typescript: ".ts",
//   go: ".go",
//   perl: ".pl",
//   rust: ".rs",
//   scala: ".scala",
//   haskell: ".hs",
//   lua: ".lua",
//   shell: ".sh",
//   sql: ".sql",
//   html: ".html",
//   css: ".css",
//   // add more file extensions here, make sure the key is same as language prop in CodeBlock.tsx component
// };

export type CodeBlockProps = Omit<ComponentProps<"div">, "children"> & {
  language?: StringLiteralUnion<BundledLanguage | SpecialLanguage, string>;
  children: string;
};
export const CodeBlock = memo(
  ({ language, children, ...props }: CodeBlockProps) => {
    const [isCopied, copyToClipboard] = useCopyToClipboard();
    const [html, setHtml] = useState<string>("");

    const lang = useMemo(() => language ?? "text", [language]);

    useEffect(() => {
      let cancelled = false;
      void (async () => {
        try {
          const highlighted = await codeToHtml(children, {
            lang,
            theme: "github-light",
          });

          if (cancelled) return;
          setHtml(highlighted);
        } catch {
          if (cancelled) return;
          setHtml(
            `<pre class="shiki"><code>${children
              .replaceAll("<", "&lt;")
              .replaceAll(">", "&gt;")}</code></pre>`,
          );
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [children, lang]);
    const onCopy = async () => {
      if (isCopied) return;
      await copyToClipboard(children);
    };
    return (
      <div className="relative w-full font-sans">
        <div className="flex w-full items-center justify-between px-6 py-2 pr-4">
          <span className="text-xs lowercase">{language}</span>
          <div className="flex items-center space-x-1">
            <Button variant="text" onClick={onCopy}>
              {isCopied ? (
                <Icon icon="lucide:clipboard-check" />
              ) : (
                <Icon icon="mingcute:copy-line" />
              )}
              <span className="sr-only">Copy code</span>
            </Button>
          </div>
        </div>
        <div
          {...props}
          className="no-scrollbar w-full overflow-x-auto px-4 py-6 text-[0.9rem] [--shiki-font-family:var(--font-mono)]"
          // Shiki returns a full <pre class="shiki"><code>...</code></pre> block
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    );
  },
);
CodeBlock.displayName = "CodeBlock";
