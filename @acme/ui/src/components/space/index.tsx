import { SpaceCompact } from "./compact";
import { Space as InternalSpace } from "./space";

export * from "./space";
type InternalSpaceType = typeof InternalSpace;

type CompoundedComponent = InternalSpaceType & {
  Compact: typeof SpaceCompact;
};
const Space = InternalSpace as unknown as CompoundedComponent;
Space.Compact = SpaceCompact;

export { Space };
export { SpaceCompact } from "./compact";
