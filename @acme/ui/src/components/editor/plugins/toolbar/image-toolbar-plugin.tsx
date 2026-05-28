"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";

import { Button } from "@acme/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/components/dialog";

import { useToolbarContext } from "../../context/toolbar-context";
import { InsertImageDialog } from "../images-plugin";

export function ImageToolbarPlugin() {
  const { activeEditor } = useToolbarContext();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="Insert Image"
          aria-label="Insert Image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
        </DialogHeader>
        <InsertImageDialog
          activeEditor={activeEditor}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
