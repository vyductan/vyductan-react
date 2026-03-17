import type { XOR } from "ts-xor";

import { Skeleton as SkeletonShadcn } from "@acme/ui/shadcn/skeleton";

import type { SkeletonProps } from "./skeleton";
import { SkeletonAvatar } from "./_components/skeleton-avatar";
import { Skeleton } from "./skeleton";

type XorSkeletonProps = XOR<
  SkeletonProps,
  React.ComponentProps<typeof SkeletonShadcn>
>;
const InternalSkeleton = (props: XorSkeletonProps) => {
  const { title, ...rest } = props;
  const isShadcnSkeleton =
    !props.paragraph &&
    (typeof title === "string" || title === undefined) &&
    !props.avatar;
  if (isShadcnSkeleton) {
    return <SkeletonShadcn title={title} {...rest} />;
  }
  return <Skeleton {...(props as SkeletonProps)} />;
};

type CompoundedComponent = typeof InternalSkeleton & {
  // Button: typeof SkeletonButton;
  Avatar: typeof SkeletonAvatar;
  // Input: typeof SkeletonInput;
  // Image: typeof SkeletonImage;
  // Node: typeof SkeletonNode;
};
const ConditionSkeleton = InternalSkeleton as CompoundedComponent;

ConditionSkeleton.Avatar = SkeletonAvatar;

export { ConditionSkeleton as Skeleton };
