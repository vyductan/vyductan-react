import React from "react";

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { Image } from "./image";

globalThis.React = React;

const SOURCE = "https://example.test/photo.jpg";

/**
 * The hover mask is the affordance that says "this opens a preview", so its
 * presence is the observable answer to "is this image previewable?".
 */
function previewMask() {
  return screen.queryByRole("button", { name: /^Preview/ });
}

afterEach(cleanup);

describe("Image previewing", () => {
  test("is on by default, matching Ant Design", () => {
    render(<Image src={SOURCE} alt="Harbour" />);

    expect(previewMask()).toBeInTheDocument();
  });

  test("is off when `preview` is false", () => {
    render(<Image src={SOURCE} alt="Harbour" preview={false} />);

    expect(previewMask()).toBeNull();
  });

  test("stays on when `preview` carries configuration", () => {
    render(<Image src={SOURCE} alt="Harbour" preview={{ maxScale: 4 }} />);

    expect(previewMask()).toBeInTheDocument();
  });

  test("a group turns previewing off for every image it holds", () => {
    render(
      <Image.PreviewGroup preview={false}>
        <Image src={SOURCE} alt="Harbour" />
      </Image.PreviewGroup>,
    );

    expect(previewMask()).toBeNull();
  });

  test("the hover mask carries no icon or label of its own", () => {
    // Ant Design 6 removed the default eye-and-text; `preview.cover` puts
    // content back.
    render(<Image src={SOURCE} alt="Harbour" />);

    expect(previewMask()).toBeEmptyDOMElement();
  });

  // Sizing utilities have to reach the <img>: the hover mask tracks the
  // wrapper, so an image that outgrows it would only be half-dimmed.
  test("`className` styles the image, `rootClassName` the wrapper", () => {
    render(
      <Image
        src={SOURCE}
        alt="Harbour"
        className="size-24 object-cover"
        rootClassName="border"
      />,
    );

    const image = screen.getByAltText("Harbour");
    expect(image).toHaveClass("size-24", "object-cover");
    expect(image.closest("div")).toHaveClass("border");
    expect(image.closest("div")).not.toHaveClass("size-24");
  });

  // The peek is noise on a page of already-large images, so it is opt-in.
  test("hover peek is off unless asked for", () => {
    render(<Image src={SOURCE} alt="Harbour" />);

    expect(
      document.querySelector('[data-slot="hover-card-trigger"]'),
    ).toBeNull();
  });

  test("`preview.hover` wraps the image in a hover trigger", () => {
    render(<Image src={SOURCE} alt="Harbour" preview={{ hover: true }} />);

    expect(
      document.querySelector('[data-slot="hover-card-trigger"]'),
    ).toBeInTheDocument();
  });

  test("hover peek follows `preview={false}` and stays off", () => {
    render(<Image src={SOURCE} alt="Harbour" preview={false} />);

    expect(
      document.querySelector('[data-slot="hover-card-trigger"]'),
    ).toBeNull();
  });

  test("`preview.cover` fills the mask", () => {
    render(<Image src={SOURCE} alt="Harbour" preview={{ cover: "Xem ảnh" }} />);

    expect(previewMask()).toHaveTextContent("Xem ảnh");
  });
});
