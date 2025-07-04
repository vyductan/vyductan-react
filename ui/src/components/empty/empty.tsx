import { cn } from "@acme/ui/lib/utils";

import { EmptyIcon } from "./empty-icon";

type EmptyProps = {
  className?: string;
  image?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  styles?: {
    image?: React.CSSProperties;
  };
};

const Empty = ({
  className,
  image,
  description,
  children,
  style,
  // styles,
}: EmptyProps) => {
  const ImageToRender = image ?? <EmptyIcon className="size-16" />;
  const DescriptionToRender = description ?? "No data";
  return (
    <div
      className={cn("mx-2 flex flex-col items-center text-sm", className)}
      style={style}
    >
      <div className="mb-2">{ImageToRender}</div>
      <div className="text-muted-foreground">{DescriptionToRender}</div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export type { EmptyProps };
export { Empty };
