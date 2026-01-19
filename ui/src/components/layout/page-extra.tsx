import { cn } from "@acme/ui/lib/utils";

import { Space } from "../space";

export type PageExtraProps = {
  extra?: React.ReactNode;
};

export const PageExtra = ({ extra }: PageExtraProps) => {
  if (!extra) {
    return null;
  }
  return (
    <span className={cn(`my-[calc(var(--margin-xs)/2)]`)}>
      <Space>{extra}</Space>
    </span>
  );
};
