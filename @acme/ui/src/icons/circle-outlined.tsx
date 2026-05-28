import type { IconWrapperProps as IconWrapperProperties } from "./wrapper";
import { IconWrapper } from "./wrapper";

// lucide
export const CircleOutlined = (
  properties: Omit<IconWrapperProperties, "children">,
) => {
  return (
    <IconWrapper aria-label="circle" {...properties}>
      <svg
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        stroke="currentColor"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    </IconWrapper>
  );
};
