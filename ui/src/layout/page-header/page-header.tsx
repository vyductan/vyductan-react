import type { AvatarProps } from "@/components/ui/avatar";
import type { BreadcrumbProps } from "@/components/ui/breadcrumb";
import type { DirectionType } from "@/components/ui/config-provider/context";
import type { TagProps } from "@/components/ui/tag";
import { useContext } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ConfigContext } from "@/components/ui/config-provider";

import { cn } from "@acme/ui/lib/utils";

import { buttonVariants, Space } from "../../components";
import { Icon } from "../../icons";
import { PageHeading } from "./_components";

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

  className?: string;
  classNames?: {
    title?: string;
  };
  backIcon?: React.ReactNode;
  onBack?: React.MouseEventHandler<HTMLElement>;

  render?: (
    originNodes: {
      title: React.ReactNode;
      extra: React.ReactNode;
      breadcrumb: React.ReactNode;
    },
    className?: string,
  ) => React.ReactNode;
};

const renderBack = (
  backIcon?: React.ReactNode,
  onBack?: React.MouseEventHandler<HTMLElement>,
) => {
  if (!backIcon || !onBack) {
    return null;
  }
  return (
    <div
      role="button"
      onClick={(e) => {
        onBack(e);
      }}
      className={cn(
        "mr-2 cursor-pointer",
        buttonVariants({ variant: "text", shape: "icon" }),
      )}
      aria-label="back"
    >
      {backIcon}
    </div>
  );
};

const getBackIcon = (
  props: PageHeaderProps,
  direction: DirectionType = "ltr",
) => {
  if (props.backIcon !== undefined) {
    return props.backIcon;
  }
  return direction === "rtl" ? (
    <Icon icon="icon-[lucide--arrow-right]" />
  ) : (
    <Icon icon="icon-[lucide--arrow-left]" />
  );
};

const renderTitle = (
  props: PageHeaderProps,
  direction: DirectionType = "ltr",
) => {
  const { title, avatar, subTitle, tags, classNames, onBack } = props;
  const hasHeading = title ?? subTitle ?? tags;
  // If there is nothing, return a null
  if (!hasHeading) {
    return;
  }
  const backIcon = getBackIcon(props, direction);
  const backIconDom = renderBack(backIcon, onBack);
  return (
    <div className={cn(`my-[calc(var(--margin-xs)/2)]`)}>
      <div className="flex items-center">
        {backIconDom}
        {avatar && <Avatar className={cn(avatar.className)} {...avatar} />}
        {title && (
          <PageHeading className={classNames?.title}>{title}</PageHeading>
        )}
      </div>
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
  return (
    <span className={cn(`my-[calc(var(--margin-xs)/2)]`)}>
      <Space>{extra}</Space>
    </span>
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
  return <Breadcrumb className="hidden sm:flex" {...breadcrumb} />;
};

const PageHeader = ({ className, render, ...props }: PageHeaderProps) => {
  const { direction } = useContext(ConfigContext);

  const title = renderTitle(props, direction);
  const extra = renderExtra(props);
  const children = renderChildren(props);
  const breadcrumb = renderBreadcrumb(props.breadcrumb);

  if (render) {
    return render({ title, extra, breadcrumb }, className);
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
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
