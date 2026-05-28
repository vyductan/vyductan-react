import { useLayoutEffect, useRef, useState } from "react";

import { cn } from "@acme/ui/lib/utils";

type ReadMoreProperties = {
  children: string;
  className?: string;
};
export const ReadMore = ({ children, className }: ReadMoreProperties) => {
  const reference = useRef<HTMLParagraphElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const [isShowingMore, setIsShowingMore] = useState(false);

  useLayoutEffect(() => {
    if (
      reference.current &&
      reference.current.offsetHeight < reference.current.scrollHeight
    ) {
      setTimeout(() => setIsTruncated(true), 0);
    } else {
      setTimeout(() => setIsTruncated(false), 0);
    }
  }, [reference]);

  const toggleIsShowingMore = () => setIsShowingMore((previous) => !previous);

  return (
    <div>
      <p
        ref={reference}
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
