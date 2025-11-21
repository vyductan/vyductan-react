import type { BreadcrumbProps } from "@/components/ui/breadcrumb";
import { Breadcrumb } from "@/components/ui/breadcrumb";

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
