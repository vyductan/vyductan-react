import type { IconWrapperProps as IconWrapperProperties } from "./wrapper";
import { IconWrapper } from "./wrapper";

// lucide
export const CheckOutlined = (
  properties: Omit<IconWrapperProperties, "children">,
) => {
  return (
    <IconWrapper aria-label="check" {...properties}>
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
          d="M20 6L9 17l-5-5"
        />
      </svg>
    </IconWrapper>
  );
};
