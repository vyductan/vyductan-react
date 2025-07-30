import { XOR } from "ts-xor";

import { Skeleton as SkeletonShadcn } from "@acme/ui/shadcn/skeleton";

import { SkeletonAvatar } from "./_components/skeleton-avatar";
import { Skeleton, SkeletonProps } from "./skeleton";

type XorSkeletonProps = XOR<
  SkeletonProps,
  React.ComponentProps<typeof SkeletonShadcn>
>;
const InternalSkeleton = (props: XorSkeletonProps) => {
  const isShadcnSkeleton = !props.paragraph && !props.title && !props.avatar;
  if (isShadcnSkeleton) {
    return (
      <SkeletonShadcn
        {...(props as React.ComponentProps<typeof SkeletonShadcn>)}
      />
    );
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
const ConditionSkeleton = InternalSkeleton as unknown as CompoundedComponent;

ConditionSkeleton.Avatar = SkeletonAvatar;

export { ConditionSkeleton as Skeleton };
