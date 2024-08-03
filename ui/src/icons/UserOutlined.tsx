import type { IconWrapperProps } from "./Wrapper";
import { IconWrapper } from "./Wrapper";

// lucide
export const UserOutlined = (props: Omit<IconWrapperProps, "children">) => {
  return (
    <IconWrapper aria-label="user" {...props}>
      <svg
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        stroke="currentColor"
      >
        <g
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        >
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </g>
      </svg>
    </IconWrapper>
  );
};
