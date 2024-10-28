import type { Swiper } from "swiper";
import { Swiper as RCSwiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import "swiper/css/thumbs";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FreeMode,
  Keyboard,
  Mousewheel,
  Navigation,
  Thumbs,
} from "swiper/modules";

import { cn } from "..";

type SwiperPreviewProps = {
  activeIndex: number;
  images: React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >[];
  onClose: () => void;
};
export const SwiperPreview = ({
  activeIndex,
  images,
  onClose,
}: SwiperPreviewProps) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<Swiper>();

  useEffect(() => {
    document.body.style.overflow = activeIndex >= 0 ? "hidden" : "";
  }, [activeIndex]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onClose]);

  // TODO: https://nextapps-de.github.io/spotlight/
  // https://www.lightgalleryjs.com/demos/swiper/

  return (
    <AnimatePresence>
      {activeIndex >= 0 && (
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
            <button onClick={onClose}>
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
          <div className="h-full">
            <RCSwiper
              style={
                {
                  "--swiper-navigation-color": "#fff",
                  "--swiper-navigation-size": "30px",
                } as React.CSSProperties
              }
              initialSlide={activeIndex}
              loop={true}
              spaceBetween={10}
              mousewheel={true}
              keyboard={{
                enabled: true,
              }}
              navigation={{
                enabled: true,
                lockClass: "text-white",
              }}
              thumbs={{
                //https://github.com/nolimits4web/swiper/issues/5630#issuecomment-1111418301
                swiper:
                  thumbsSwiper && !thumbsSwiper.destroyed
                    ? thumbsSwiper
                    : undefined,
              }}
              modules={[FreeMode, Mousewheel, Navigation, Thumbs, Keyboard]}
              className="h-4/5 pt-12"
            >
              {images.map((imgProps) => (
                <SwiperSlide>
                  <div className="swiper-zoom-container">
                    <img {...imgProps} />
                  </div>
                </SwiperSlide>
              ))}
            </RCSwiper>

            <RCSwiper
              onSwiper={setThumbsSwiper}
              loop={true}
              spaceBetween={10}
              slidesPerView={4}
              freeMode={true}
              watchSlidesProgress={true}
              modules={[FreeMode, Navigation, Thumbs]}
              className="box-border h-[18%] pt-6"
              wrapperClass="[&>.swiper-slide-thumb-active]:opacity-100"
            >
              {images.map((imgProps) => (
                <SwiperSlide className="h-[100px] !w-auto cursor-pointer rounded-md border border-white p-1 opacity-40">
                  <div className="swiper-zoom-container">
                    <img {...imgProps} />
                  </div>
                </SwiperSlide>
              ))}
            </RCSwiper>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
