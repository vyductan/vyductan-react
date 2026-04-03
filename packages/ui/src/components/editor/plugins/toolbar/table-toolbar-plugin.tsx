"use client";

import { useState } from "react";
import { TableIcon } from "lucide-react";

import { Button } from "@acme/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/components/dialog";

import { useToolbarContext } from "../../context/toolbar-context";
import { InsertTableDialog } from "../table-plugin";

export function TableToolbarPlugin() {
  const { activeEditor } = useToolbarContext();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="Insert Table"
          aria-label="Insert Table"
        >
          <TableIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert Table</DialogTitle>
        </DialogHeader>
        <InsertTableDialog
          activeEditor={activeEditor}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
