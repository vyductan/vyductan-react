import type { IconWrapperProps } from "./Wrapper";
import { IconWrapper } from "./Wrapper";

// lucide
export const ChevronRightOutlined = (
  props: Omit<IconWrapperProps, "children">,
) => {
  return (
    <IconWrapper aria-label="chevron-right" {...props}>
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
