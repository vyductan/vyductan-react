import type { ReactNode } from "react";

import type { PageHeaderProps } from "../page-header";
import { clsm } from "../..";
import { PageHeader } from "../page-header";

export type PageContainerProps = {
  children: ReactNode;
  header?: PageHeaderProps;
  className?: string;
  content?: {
    className?: string;
  };
  loading?: boolean;
};
export const PageContainer = ({
  children,
  header,
  className,
  content,
  loading = false,
}: PageContainerProps) => {
  return (
    <main
      className={clsm(
        "mx-auto w-full max-w-screen-lg",
        "flex flex-1 flex-col gap-4 p-4 lg:gap-3 lg:p-6",
        className,
      )}
    >
      {loading ? (
        <>Loading</>
      ) : (
        <>
          {header && <PageHeader {...header} />}
          <div className={clsm("relative", content?.className)}>{children}</div>
        </>
      )}
    </main>
  );
};
