import type { IconWrapperProps } from "./Wrapper";
import IconWrapper from "./Wrapper";

// lucide
export const CheckOutlined = (props: Omit<IconWrapperProps, "children">) => {
  return (
    <IconWrapper aria-label="check" {...props}>
      <svg
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        stroke="currentColor"
        {...props}
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
