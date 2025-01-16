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
      extra: React.ReactNode;
      breadcrumb: React.ReactNode;
    },
    className?: string,
  ) => React.ReactNode;
};

const renderTitle = (props: PageHeaderProps) => {
  const { title, avatar, subTitle, tags } = props;
  const hasHeading = title ?? subTitle ?? tags;
  // If there is nothing, return a null
  if (!hasHeading) {
    return;
  }
  // const backIcon = getBackIcon(props, direction);
  // const backIconDom = renderBack(backIcon, onBack);
  return (
    <div className={cn(`my-[calc(var(--margin-xs)/2)]`)}>
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
  );
};
const renderExtra = (props: PageHeaderProps) => {
  const { extra } = props;
  if (!extra) {
    return;
  }
  return <span className={cn(`my-[calc(var(--margin-xs)/2)]`)}>{extra}</span>;
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
  const extra = renderExtra(props);
  const children = renderChildren(props);
  const breadcrumb = renderBreadcrumb(props.breadcrumb);

  if (render) {
    return render({ title, extra, breadcrumb }, className);
  }

  return (
    <div className={cn("space-y-2", className)}>
      {breadcrumb}
      <div className={cn("flex justify-between")}>
        {title}
        {extra}
      </div>
      {children}
    </div>
  );
};

export { PageHeader };
export type { PageHeaderProps };
