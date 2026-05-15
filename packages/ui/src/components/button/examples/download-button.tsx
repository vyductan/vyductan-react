"use client";

import type React from "react";
import { useState } from "react";
import { Check, Download } from "lucide-react";

import { Button } from "@acme/ui/components/button";

import { AsyncActionButton } from "./async-action-button";

type DownloadMode = "success" | "error";

async function downloadReport(mode: DownloadMode): Promise<void> {
  await new Promise((resolve) => globalThis.setTimeout(resolve, 900));

  if (mode === "error") {
    throw new Error("Download failed");
  }
}

function App(): React.JSX.Element {
  const [mode, setMode] = useState<DownloadMode>("success");

  return (
    <div className="bg-muted/40 grid w-[min(100%,28rem)] gap-3 rounded-2xl border p-4 shadow-sm">
      <div className="bg-background flex items-center justify-between gap-4 rounded-xl px-4 py-3">
        <div>
          <p className="font-medium">Monthly report</p>
          <p className="text-muted-foreground text-sm">CSV export · 2.4 MB</p>
        </div>
        <AsyncActionButton
          action={() => downloadReport(mode)}
          errorTooltip="Could not download this report. Try again."
          idleIcon={<Download className="transition-transform duration-200" />}
          successIcon={<Check />}
          resetDelay={2000}
          type="primary"
        >
          Download
        </AsyncActionButton>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type={mode === "success" ? "primary" : "default"}
          size="small"
          onClick={() => setMode("success")}
        >
          Success
        </Button>
        <Button
          danger={mode === "error"}
          type={mode === "error" ? "primary" : "default"}
          size="small"
          onClick={() => setMode("error")}
        >
          Fail
        </Button>
      </div>
      <p className="text-muted-foreground text-sm">
        Switch to Fail before clicking Download to preview the inline error
        tooltip at the button.
      </p>
    </div>
  );
}

export default App;
