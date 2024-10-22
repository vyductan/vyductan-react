import { Swiper as RCSwiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/zoom";
import "swiper/css/pagination";
import "swiper/css/free-mode";

import { useState } from "react";
import { FreeMode, Pagination } from "swiper/modules";

import { SwiperPreview } from "./preview";

type SwiperProps = {
  images: React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >[];
};
export const Swiper = ({ images }: SwiperProps) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  return (
    <>
      <RCSwiper
        style={
          {
            "--swiper-pagination-color": "#fff",
          } as React.CSSProperties
        }
        className="!ml-0"
        freeMode={true}
        slidesPerView={1}
        spaceBetween={10}
        breakpoints={{
          320: {
            slidesPerView: 2,
            spaceBetween: 16,
          },
          480: {
            slidesPerView: 3,
            spaceBetween: 16,
          },
          640: {
            slidesPerView: 4,
            spaceBetween: 16,
          },
        }}
        pagination={{
          horizontalClass: "!bottom-0",
          clickable: true,
        }}
        modules={[Pagination, FreeMode]}
      >
        {images.map((imgProps, index) => (
          <SwiperSlide
            className="h-[70px] !w-auto cursor-pointer"
            key={index}
            onClick={() => {
              setActiveIndex(index);
            }}
          >
            <div className="swiper-zoom-container">
              <img className="max-h-full rounded-md" {...imgProps} />
            </div>
          </SwiperSlide>
        ))}
      </RCSwiper>

      <SwiperPreview
        activeIndex={activeIndex}
        onClose={() => setActiveIndex(-1)}
        images={images}
      />
    </>
  );
};
