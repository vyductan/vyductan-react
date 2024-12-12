// import { ArrowLeftOutlined, ArrowRightOutlined } from "@acme/ui/icons";

import type { AvatarProps } from "../../avatar";
import type { BreadcrumbProps } from "../../breadcrumb";
import type { TagProps } from "../../tag";
import { cn } from "../..";
import { Avatar } from "../../avatar";
import { Breadcrumb } from "../../breadcrumb";

type PageHeaderProps = {
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  children?: React.ReactNode;
  extra?: React.ReactNode;
  breadcrumb?: BreadcrumbProps & {
    render?: (props: BreadcrumbProps) => React.ReactNode;
  };
  avatar?: AvatarProps;
  tags?: React.ReactElement<TagProps> | React.ReactElement<TagProps>[];
  onBack?: (event?: React.MouseEvent<HTMLElement>) => void;

  className?: string;
  backIcon?: React.ReactNode;

  render?: (
    originNodes: {
      title: React.ReactNode;
      breadcrumb: React.ReactNode;
    },
    className?: string,
  ) => React.ReactNode;
};

const renderTitle = (props: PageHeaderProps) => {
  const { title, avatar, subTitle, tags, extra } = props;
  const hasHeading = title ?? subTitle ?? tags ?? extra;
  // If there is nothing, return a null
  if (!hasHeading) {
    return;
  }
  // const backIcon = getBackIcon(props, direction);
  // const backIconDom = renderBack(backIcon, onBack);
  return (
    <div className={cn("flex h-10 items-center justify-between")}>
      <div className="">
        {/* {backIconDom} */}
        {avatar && <Avatar className={cn(avatar.className)} {...avatar} />}
        {title && (
          <h1
            title={typeof title === "string" ? title : undefined}
            className="text-2xl font-bold"
          >
            {title}
          </h1>
        )}
        {subTitle && (
          <p
            title={typeof subTitle === "string" ? subTitle : undefined}
            className="text-muted-foreground"
          >
            {subTitle}
          </p>
        )}
        {tags && <span>{tags}</span>}
      </div>
      {extra && (
        <span>
          <div>{extra}</div>
        </span>
      )}
    </div>
  );
};
const renderChildren = (props: PageHeaderProps) => {
  const { children } = props;
  if (!children) {
    return;
  }
  return <div>{children}</div>;
};

const renderBreadcrumb = (breadcrumb?: PageHeaderProps["breadcrumb"]) => {
  if (breadcrumb?.render) return breadcrumb.render(breadcrumb);
  if (!breadcrumb?.items?.length) return <></>;
  return <Breadcrumb {...breadcrumb} />;
};

const PageHeader = ({ className, render, ...props }: PageHeaderProps) => {
  const title = renderTitle(props);
  const children = renderChildren(props);
  const breadcrumb = renderBreadcrumb(props.breadcrumb);

  if (render) {
    return render({ title, breadcrumb }, className);
  }

  return (
    <div className={cn("space-y-2", className)}>
      {breadcrumb}
      {title}
      {children}
    </div>
  );
};

export { PageHeader };
export type { PageHeaderProps };
