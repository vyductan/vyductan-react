import type { IconWrapperProps } from "./Wrapper";
import { IconWrapper } from "./Wrapper";

// lucide
export const LogoutOutlined = (props: Omit<IconWrapperProps, "children">) => {
  return (
    <IconWrapper aria-label="log-out" {...props}>
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
          d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14l5-5l-5-5m5 5H9"
        />
      </svg>
    </IconWrapper>
  );
};
