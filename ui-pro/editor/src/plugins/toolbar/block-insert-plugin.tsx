import { PlusIcon } from "lucide-react";

import {
  SelectContent,
  SelectGroup,
  SelectRoot,
  SelectTrigger,
} from "@acme/ui/select";

import { useEditorModal } from "../../editor-hooks/use-modal";

export function BlockInsertPlugin({ children }: { children: React.ReactNode }) {
  const [modal] = useEditorModal();

  return (
    <>
      {modal}
      <SelectRoot value={""}>
        <SelectTrigger className="h-8 w-min gap-1">
          <PlusIcon className="size-4" />
          <span>Insert</span>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>{children}</SelectGroup>
        </SelectContent>
      </SelectRoot>
    </>
  );
}
