import type { BreadcrumbProps } from "@acme/ui/components/breadcrumb";
import { Breadcrumb } from "@acme/ui/components/breadcrumb";

export type PageBreadcrumbProps = BreadcrumbProps & {
  render?: (props: BreadcrumbProps) => React.ReactNode;
};

export const PageBreadcrumb = ({
  render,
  ...breadcrumb
}: PageBreadcrumbProps) => {
  if (render) return render(breadcrumb);
  if (!breadcrumb.items?.length) return null;
  return <Breadcrumb className="hidden sm:flex" {...breadcrumb} />;
};
