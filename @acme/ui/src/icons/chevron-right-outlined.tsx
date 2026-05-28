import type { IconWrapperProps as IconWrapperProperties } from "./wrapper";
import { IconWrapper } from "./wrapper";

// lucide
export const ChevronRightOutlined = (
  properties: Omit<IconWrapperProperties, "children">,
) => {
  return (
    <IconWrapper aria-label="chevron-right" {...properties}>
      <svg
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        stroke="currentColor"
      >
        <path
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="m9 18l6-6l-6-6"
        />
      </svg>
    </IconWrapper>
  );
};
