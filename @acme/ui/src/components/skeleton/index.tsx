import type { XOR } from "ts-xor";

import { Skeleton as SkeletonShadcn } from "@acme/ui/shadcn/skeleton";

import type { SkeletonProps as SkeletonProperties } from "./skeleton";
import { SkeletonAvatar } from "./_components/skeleton-avatar";
import { Skeleton } from "./skeleton";

type XorSkeletonProperties = XOR<
  SkeletonProperties,
  React.ComponentProps<typeof SkeletonShadcn>
>;
const InternalSkeleton = (properties: XorSkeletonProperties) => {
  const { title, ...rest } = properties;
  const isShadcnSkeleton =
    !properties.paragraph &&
    (typeof title === "string" || title === undefined) &&
    !properties.avatar;
  if (isShadcnSkeleton) {
    return <SkeletonShadcn title={title} {...rest} />;
  }
  return <Skeleton {...(properties as SkeletonProperties)} />;
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
