import type { ReactNode } from "react";

import type { PageHeaderProps } from "../page-header";
import { clsm } from "../..";
import { PageHeader } from "../page-header";

export type PageContainerProps = {
  children: ReactNode;
  header?: PageHeaderProps;
  content?: {
    className?: string;
  };
};
export const PageContainer = ({
  children,
  header,
  content,
}: PageContainerProps) => {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-3 lg:p-6">
      {header && <PageHeader {...header} />}
      <div className={clsm("relative", content?.className)}>{children}</div>
    </main>
  );
};
