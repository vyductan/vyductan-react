import type { ReactNode } from "react";

import type { PageHeaderProps } from "../page-header";
import { PageHeader } from "../page-header";

export type PageContainerProps = {
  children: ReactNode;
  header?: PageHeaderProps;
};
export const PageContainer = ({ children, header }: PageContainerProps) => {
  return (
    <main>
      <PageHeader {...header} />
      <div className="relative">{children}</div>
    </main>
  );
};
