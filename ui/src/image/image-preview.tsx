import { AnimatePresence, motion } from "framer-motion";
import { useMergedState } from "rc-util";

import { cn } from "..";

type ImagePreviewProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  children?: React.ReactNode;
};
export const ImagePreview = ({
  open: propOpen,
  onOpenChange: propOnOpenChange,

  children,
  // ...props
}: ImagePreviewProps) => {
  const [open, setOpen] = useMergedState(false, {
    value: propOpen,
    onChange: propOnOpenChange,
  });
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="swiper-preview"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
          }}
          className={cn("fixed inset-0 z-[99999]", "bg-black")}
        >
          <div className="absolute right-6 top-0 z-10 flex h-12 items-center justify-between text-white">
            <div></div>
            <button
              onClick={() => {
                setOpen(false);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 24 24"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M18 6L6 18M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="h-full">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
