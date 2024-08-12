import { clsm } from "..";
import { EmptyIcon } from "./EmptyIcon";

type EmptyProps = {
  className?: string;
  image?: React.ReactNode;
  description?: React.ReactNode;
};

const Empty = ({ className, image, description }: EmptyProps) => {
  const ImageToRender = image ?? <EmptyIcon className="size-16" />;
  const DescriptionToRender = description ?? "No data";
  return (
    <div
      className={clsm(
        "flex flex-col items-center px-4 py-2 text-sm",
        className,
      )}
    >
      <div className="mb-2">{ImageToRender}</div>
      <div className="text-foreground-muted">{DescriptionToRender}</div>
    </div>
  );
};

export type { EmptyProps };
export { Empty };
