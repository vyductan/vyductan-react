import { useLayoutEffect, useRef, useState } from "react";

import { cn } from "..";

type ReadMoreProps = {
  children: string;
  className?: string;
};
export const ReadMore = ({ children, className }: ReadMoreProps) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const [isShowingMore, setIsShowingMore] = useState(false);

  useLayoutEffect(() => {
    if (ref.current && ref.current.offsetHeight < ref.current.scrollHeight) {
      setIsTruncated(true);
    } else {
      setIsTruncated(false);
    }
  }, [ref]);

  const toggleIsShowingMore = () => setIsShowingMore((prev) => !prev);

  return (
    <div>
      <p
        ref={ref}
        className={cn(
          "break-words",
          className,
          isShowingMore && "line-clamp-none",
        )}
      >
        {children}
      </p>
      {isTruncated && (
        <button onClick={toggleIsShowingMore}>
          {isShowingMore ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
};
