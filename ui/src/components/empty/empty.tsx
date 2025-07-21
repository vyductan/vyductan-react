import { cn } from "@acme/ui/lib/utils";

import { EmptyIcon } from "./empty-icon";

type EmptyProps = {
  className?: string;
  image?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
};

const Empty = ({ className, image, description, children }: EmptyProps) => {
  const ImageToRender = image ?? <EmptyIcon className="size-16" />;
  const DescriptionToRender = description ?? "No data";
  return (
    <div className={cn("mx-2 flex flex-col items-center text-sm", className)}>
      <div className="mb-2">{ImageToRender}</div>
      <div className="text-muted-foreground">{DescriptionToRender}</div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export type { EmptyProps };
export { Empty };
