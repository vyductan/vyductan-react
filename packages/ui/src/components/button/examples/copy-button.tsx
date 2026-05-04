"use client";

import type React from "react";
import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@acme/ui/components/button";

const SNIPPET = "pnpm -F @acme/ui storybook";

type CopyState = "idle" | "copied" | "error";

type CopyButtonProps = {
  value: string;
};

function CopyButton({ value }: CopyButtonProps): React.JSX.Element {
  const [copyState, setCopyState] = useState<CopyState>("idle");

  useEffect(() => {
    if (copyState === "idle") {
      return;
    }

    const timeout = globalThis.setTimeout(() => setCopyState("idle"), 2000);

    return () => globalThis.clearTimeout(timeout);
  }, [copyState]);

  async function copySnippet(): Promise<void> {
    if (!navigator.clipboard?.writeText) {
      setCopyState("error");
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  }

  const isCopied = copyState === "copied";

  return (
    <Button
      aria-label={isCopied ? "Copied command" : "Copy command"}
      type="default"
      shape="icon"
      icon={isCopied ? <Check /> : <Copy />}
      onClick={copySnippet}
    />
  );
}

function App(): React.JSX.Element {
  return (
    <div className="grid w-[min(100%,32rem)] gap-3 rounded-2xl border bg-muted/40 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3 rounded-xl bg-background px-4 py-3 font-mono text-sm">
        <span className="truncate text-muted-foreground">{SNIPPET}</span>
        <CopyButton value={SNIPPET} />
      </div>
      <p className="text-sm text-muted-foreground">
        Use a composed button to copy command snippets and confirm the action in
        place.
      </p>
    </div>
  );
}

export default App;
