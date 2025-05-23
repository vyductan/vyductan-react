"use client";

import type { ImageProps } from "next/image";
import { useState } from "react";
import Image from "next/image";

const MyImage = ({ src, placeholder, ...props }: ImageProps) => {
  const [imageSrc, setImageSrc] = useState(src);

  const base64Placeholder =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/ehjKOcAAAAASUVORK5CYII="; // Màu xám

  return (
    <Image
      src={imageSrc}
      onError={() => setImageSrc(base64Placeholder)}
      placeholder={placeholder ?? base64Placeholder}
      {...props}
    />
  );
};

export default MyImage;
