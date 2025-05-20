import { cn } from "@acme/ui/lib/utils";

import type { UploadFileItem } from "../types";
import { Card } from "../../components/card";
import { Checkbox } from "../../components/checkbox";
import { Progress } from "../../components/progress";
import MyImage from "./image";

type Props = {
  url: string;
  name: string;
  status: UploadFileItem["status"];
  percent?: number;
  selected?: boolean;
  onSelectChange?: (selected: boolean) => void;
};
export const ImageUploadItem = ({
  url,
  name,
  status,
  percent,
  selected,
  onSelectChange,
}: Props) => {
  return (
    <Card
      className={cn(
        "hover:bg-accent relative cursor-pointer",
        selected && "bg-primary-50",
      )}
      classNames={{
        content: "p-8 flex items-center justify-center flex-col",
      }}
      onClick={() => {
        onSelectChange?.(!selected);
      }}
    >
      {/* Select checkbox */}
      <Checkbox checked={selected} className="absolute top-2 left-2" />

      {/* Media preview */}
      <div className="mb-2 flex aspect-square h-[100px] w-[100px] items-center">
        <MyImage
          src={url}
          alt={name}
          width={100}
          height={100}
          style={{
            maxHeight: 100,
            objectFit: "contain",
          }}
        />
      </div>

      {/* Upload progress */}
      {status === "uploading" && (
        <div className="bg-primary/50 absolute inset-0 flex items-center justify-center">
          <Progress
            type="circle"
            percent={percent}
            size={80}
            className="mb-4"
          />
        </div>
      )}
      <div className="mt-auto w-full truncate text-center text-xs">{name}</div>
      <div className="text-muted-foreground text-xs uppercase">
        {name.split(".").at(-1)}
      </div>
    </Card>
  );
};
