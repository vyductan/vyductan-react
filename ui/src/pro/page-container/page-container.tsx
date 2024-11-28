import type { ReactNode } from "react";

import type { PageHeaderProps } from "../page-header";
import { cn } from "../..";
import { PageHeader } from "../page-header";

export type PageContainerProps = {
  children: ReactNode;
  header?: PageHeaderProps;
  className?: string;
  classNames?: {
    content?: string;
  };
  loading?: boolean;
};
export const PageContainer = ({
  children,
  header,
  className,
  classNames,
  loading = false,
}: PageContainerProps) => {
  return (
    <main
      className={cn(
        "mx-auto w-full max-w-screen-lg",
        "flex flex-1 flex-col p-4 lg:p-6",
        className,
      )}
    >
      {loading ? (
        <>Loading</>
      ) : (
        <>
          {header && <PageHeader {...header} />}
          <div className={cn("relative", classNames?.content)}>{children}</div>
        </>
      )}
    </main>
  );
};
