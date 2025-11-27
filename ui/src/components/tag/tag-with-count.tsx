export type TagWithCountProps = React.ComponentProps<"span"> & {
  count?: React.ReactNode;

  /** Set offset of the badge dot [left, top] */
  offset?: [number, number];
};

export const TagWithCount = ({
  count,
  children,
  offset,
  className,
  ...restProps
}: TagWithCountProps) => {
  if (!count) {
    return (
      <span className={className} {...restProps}>
        {children}
      </span>
    );
  }

  return (
    <span className="relative" {...restProps}>
      {children}
      <span
        className="absolute end-0 top-0 origin-[100%_0%] translate-x-1/2 -translate-y-1/2"
        style={
          offset
            ? {
                marginTop: offset[1],
                right: -offset[0],
              }
            : {}
        }
      >
        {count}
      </span>
    </span>
  );
};
