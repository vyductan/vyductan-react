import IconWrapper, { IconWrapperProps } from "./Wrapper";

// mi
const CloseOutlined = (props: Omit<IconWrapperProps, "children">) => {
  return (
    <IconWrapper aria-label="close" {...props}>
      <svg
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        stroke="currentColor"
      >
        <path d="M 0.502 0.525 C 1.17 -0.144 2.254 -0.144 2.924 0.525 L 11.99 9.597 L 21.056 0.525 C 21.972 -0.425 23.57 -0.026 23.933 1.243 C 24.108 1.853 23.933 2.508 23.478 2.948 L 14.412 12.021 L 23.478 21.094 C 24.394 22.043 23.938 23.629 22.659 23.948 C 22.087 24.09 21.48 23.929 21.056 23.517 L 11.99 14.445 L 2.924 23.517 C 1.975 24.434 0.391 23.98 0.072 22.7 C -0.072 22.125 0.091 21.519 0.502 21.094 L 9.568 12.021 L 0.502 2.948 C -0.168 2.28 -0.168 1.193 0.502 0.525 Z"></path>
      </svg>
    </IconWrapper>
  );
};

export default CloseOutlined;
