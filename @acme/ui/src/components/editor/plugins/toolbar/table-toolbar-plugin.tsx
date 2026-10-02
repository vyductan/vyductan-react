"use client";

import { TableIcon } from "lucide-react";

import { Button } from "@acme/ui/components/button";

import { useToolbarContext } from "../../context/toolbar-context";
import { insertDefaultTable } from "../table-plugin";

export function TableToolbarPlugin() {
  const { activeEditor } = useToolbarContext();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      title="Insert Table"
      aria-label="Insert Table"
      onClick={() => insertDefaultTable(activeEditor)}
    >
      <TableIcon className="h-4 w-4" />
    </Button>
  );
}
