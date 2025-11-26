import type { AvatarProps } from "@/components/ui/avatar";
import type { BreadcrumbProps } from "@/components/ui/breadcrumb";
import type { DirectionType } from "@/components/ui/config-provider/context";
import type { TagProps } from "@/components/ui/tag";
import { useContext } from "react";
import { Avatar } from "@/components/ui/avatar";
import { ConfigContext } from "@/components/ui/config-provider";

import { cn } from "@acme/ui/lib/utils";

import { Icon } from "../../icons";
import { buttonColorVariants, buttonVariants } from "../button";
import { PageBreadcrumb } from "./page-breadcrumb";
import { PageDescription } from "./page-description";
import { PageExtra } from "./page-extra";
import { PageTitle } from "./page-title";

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
        buttonVariants({ shape: "icon" }),
        buttonColorVariants({ variant: "text" }),
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

const PageHeader = ({ className, render, ...props }: PageHeaderProps) => {
  const { direction } = useContext(ConfigContext);

  const { title, avatar, subTitle, tags, classNames, onBack } = props;
  const hasHeading = title ?? subTitle ?? tags;

  const backIcon = getBackIcon(props, direction);
  const backIconDom = renderBack(backIcon, onBack);

  const titleNode = hasHeading ? (
    <div className={cn(`my-[calc(var(--margin-xs)/2)]`)}>
      <div className="flex items-center">
        {backIconDom}
        {avatar && <Avatar className={cn(avatar.className)} {...avatar} />}
        {title && <PageTitle className={classNames?.title}>{title}</PageTitle>}
      </div>
      <PageDescription subTitle={subTitle} />
      {tags && <span>{tags}</span>}
    </div>
  ) : null;

  const extraNode = <PageExtra extra={props.extra} />;
  const breadcrumbNode = props.breadcrumb ? (
    <PageBreadcrumb {...props.breadcrumb} />
  ) : null;

  if (render) {
    return render(
      { title: titleNode, extra: extraNode, breadcrumb: breadcrumbNode },
      className,
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {breadcrumbNode}
      <div className={cn("flex justify-between")}>
        {titleNode}
        {extraNode}
      </div>
      {props.children && <div>{props.children}</div>}
    </div>
  );
};

export { PageHeader };
export type { PageHeaderProps };
