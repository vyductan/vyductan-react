"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@acme/ui/components/button";
import type { ButtonProps } from "@acme/ui/components/button";

const SNIPPET = "pnpm -F @acme/ui storybook";

type CopyState = "idle" | "copied" | "error";

export type CopyButtonProps = Omit<
  ButtonProps,
  "children" | "className" | "icon" | "onClick" | "shape" | "type" | "variant"
> & {
  value: string;
  ariaLabel?: string;
  copiedLabel?: string;
  resetDelay?: number;
  onCopied?: () => void;
  className?: string;
};

export function CopyButton({
  value,
  ariaLabel = "Copy command",
  copiedLabel = "Copied command",
  resetDelay = 2000,
  onCopied,
  className,
  ...buttonProps
}: CopyButtonProps): React.JSX.Element {
  const [copyState, setCopyState] = useState<CopyState>("idle");

  useEffect(() => {
    if (copyState === "idle") {
      return;
    }

    const timeout = globalThis.setTimeout(
      () => setCopyState("idle"),
      resetDelay,
    );

    return () => globalThis.clearTimeout(timeout);
  }, [copyState, resetDelay]);

  async function copySnippet(): Promise<void> {
    if (!navigator.clipboard?.writeText) {
      setCopyState("error");
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setCopyState("copied");
      onCopied?.();
    } catch {
      setCopyState("error");
    }
  }

  const isCopied = copyState === "copied";

  return (
    <Button
      {...buttonProps}
      aria-label={isCopied ? copiedLabel : ariaLabel}
      variant="text"
      shape="icon"
      className={className}
      icon={isCopied ? <Check /> : <Copy />}
      onClick={copySnippet}
    />
  );
}

function App(): React.JSX.Element {
  return (
    <div className="bg-muted/40 grid w-[min(100%,32rem)] gap-3 rounded-2xl border p-4 shadow-sm">
      <div className="bg-background flex items-center justify-between gap-3 rounded-xl px-4 py-3 font-mono text-sm">
        <span className="text-muted-foreground truncate">{SNIPPET}</span>
        <CopyButton value={SNIPPET} />
      </div>
      <p className="text-muted-foreground text-sm">
        Use a composed button to copy command snippets and confirm the action in
        place.
      </p>
    </div>
  );
}

export default App;
