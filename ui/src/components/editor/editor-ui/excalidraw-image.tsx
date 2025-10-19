/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  ExcalidrawElement,
  NonDeleted,
} from "@excalidraw/excalidraw/element/types";
import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types";
import type { JSX } from "react";
import * as React from "react";
import { useEffect, useState } from "react";
import { exportToSvg } from "@excalidraw/excalidraw";

type ImageType = "svg" | "canvas";

type Dimension = "inherit" | number;

type Props = {
  /**
   * Configures the export setting for SVG/Canvas
   */
  appState: AppState;
  /**
   * The css class applied to image to be rendered
   */
  className?: string;
  /**
   * The Excalidraw elements to be rendered as an image
   */
  elements: NonDeleted<ExcalidrawElement>[];
  /**
   * The Excalidraw files associated with the elements
   */
  files: BinaryFiles;
  /**
   * The height of the image to be rendered
   */
  height?: Dimension;
  /**
   * The type of image to be rendered
   */
  imageType?: ImageType;
  /**
   * The css class applied to the root element of this component
   */
  rootClassName?: string | null;
  /**
   * The width of the image to be rendered
   */
  width?: Dimension;
};

// exportToSvg has fonts from excalidraw.com
// We don't want them to be used in open source
const removeStyleFromSvg_HACK = (svg: SVGElement) => {
  const styleTag = svg.firstElementChild?.firstElementChild;

  // Generated SVG is getting double-sized by height and width attributes
  // We want to match the real size of the SVG element
  const viewBox = svg.getAttribute("viewBox");
  if (viewBox != undefined) {
    const viewBoxDimensions = viewBox.split(" ");
    svg.setAttribute("width", viewBoxDimensions[2]!);
    svg.setAttribute("height", viewBoxDimensions[3]!);
  }

  if (styleTag?.tagName === "style") {
    styleTag.remove();
  }
};

/**
 * @explorer-desc
 * A component for rendering Excalidraw elements as a static image
 */
const ExcalidrawImage = React.forwardRef<HTMLDivElement, Props>(
  (
    {
      elements,
      files,
      appState,
      rootClassName = null,
      width = "inherit",
      height = "inherit",
    },
    ref,
  ): JSX.Element => {
    const [Svg, setSvg] = useState<SVGElement | null>(null);

    useEffect(() => {
      const setContent = async () => {
        // Only run on client side to avoid SSR issues
        if (globalThis.window === undefined) {
          return;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const svg: SVGElement = await exportToSvg({
          appState,
          elements,
          files,
        });
        removeStyleFromSvg_HACK(svg);

        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.setAttribute("display", "block");

        setSvg(svg);
      };
      void setContent();
    }, [elements, files, appState]);

    const containerStyle: React.CSSProperties = {};
    if (width !== "inherit") {
      containerStyle.width = `${width}px`;
    }
    if (height !== "inherit") {
      containerStyle.height = `${height}px`;
    }

    return (
      <div
        ref={ref}
        className={rootClassName ?? ""}
        style={containerStyle}
        dangerouslySetInnerHTML={{ __html: Svg?.outerHTML ?? "" }}
      />
    );
  },
);

ExcalidrawImage.displayName = "ExcalidrawImage";

export default ExcalidrawImage;
