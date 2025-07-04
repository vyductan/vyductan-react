import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardMetaProps {
  style?: React.CSSProperties;
  className?: string;
  avatar?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
}

const CardMeta: React.FC<CardMetaProps> = (props) => {
  const { className, avatar, title, description, ...others } = props;

  const classString = cn("flex items-start p-4", className);

  const avatarDom: React.ReactNode = avatar ? (
    <div data-slot="card-meta-avatar" className="mr-4 flex-shrink-0">
      {avatar}
    </div>
  ) : null;

  const titleDom: React.ReactNode = title ? (
    <div
      data-slot="card-meta-title"
      className="text-foreground text-base font-semibold"
    >
      {title}
    </div>
  ) : null;

  const descriptionDom: React.ReactNode = description ? (
    <div
      data-slot="card-meta-description"
      className="text-muted-foreground mt-1 text-sm"
    >
      {description}
    </div>
  ) : null;

  const MetaDetail: React.ReactNode =
    titleDom || descriptionDom ? (
      <div data-slot="card-meta-detail" className="min-w-0 flex-1">
        {titleDom}
        {descriptionDom}
      </div>
    ) : null;

  return (
    <div data-slot="card-meta" {...others} className={classString}>
      {avatarDom}
      {MetaDetail}
    </div>
  );
};

export { CardMeta };
