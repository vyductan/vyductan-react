import { SkeletonAvatar } from "./_components/skeleton-avatar";
import { Skeleton as InternalSkeleton } from "./skeleton";

type CompoundedComponent = typeof InternalSkeleton & {
  // Button: typeof SkeletonButton;
  Avatar: typeof SkeletonAvatar;
  // Input: typeof SkeletonInput;
  // Image: typeof SkeletonImage;
  // Node: typeof SkeletonNode;
};

const Skeleton = InternalSkeleton as unknown as CompoundedComponent;

Skeleton.Avatar = SkeletonAvatar;

export { Skeleton };
