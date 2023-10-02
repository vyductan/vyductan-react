import IconWrapper, { IconWrapperProps } from "./Wrapper";

// lucide
export const CircleOutlined = (props: Omit<IconWrapperProps, "children">) => {
  return (
    <IconWrapper aria-label="circle" {...props}>
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
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
        />
      </svg>
    </IconWrapper>
  );
};
