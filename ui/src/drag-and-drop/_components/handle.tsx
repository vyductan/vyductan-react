import { useSortable } from "@dnd-kit/sortable";

import { Button } from "../../button";
import { Icon } from "../../icons";

export const HandleButton = ({ id }: { id: string }) => {
  const { setActivatorNodeRef, listeners } = useSortable({
    id,
  });

  return (
    <Button
      variant="ghost"
      icon={<Icon icon="icon-[octicon--grabber-16]" />}
      {...listeners}
      ref={setActivatorNodeRef}
    />
  );
};
