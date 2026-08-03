import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import BasicDemo from "./examples/basic";
import FallbackDemo from "./examples/fallback";
import GalleryLightboxDemo from "./examples/gallery-lightbox";
import ImagePreviewDemo from "./examples/image-preview";
import MediaGalleryDemo from "./examples/media-gallery";
import MediaGalleryLayoutsDemo from "./examples/media-gallery-layouts";
import PlaceholderDemo from "./examples/placeholder";
import PreviewDemo from "./examples/preview";
import PreviewGroupDemo from "./examples/preview-group";
import PreviewGroupItemsDemo from "./examples/preview-group-items";
import SeekableVideoDemo from "./examples/seekable-video";
import VideoSyncDemo from "./examples/video-sync";
import { Image } from "./image";

// Inline so the interaction test never depends on the network: a remote 404
// would swap the `<img>` for the fallback and break the query by alt text.
const inlineSource =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="140"><rect width="200" height="140" fill="#94a3b8"/></svg>`,
  );

const meta = {
  title: "Components/Image",
  component: Image,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    src: {
      control: "text",
    },
    fallback: {
      control: "text",
    },
    width: {
      control: "number",
    },
    height: {
      control: "number",
    },
    preview: {
      control: "boolean",
    },
    placeholder: {
      control: false,
    },
  },
} satisfies Meta<typeof Image>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: "https://picsum.photos/seed/acme-image-args/600/400",
    alt: "Mountain lake at sunrise",
    width: 300,
    height: 200,
    className: "overflow-hidden rounded-lg",
  },
};

export const Basic: Story = {
  render: () => <BasicDemo />,
};

export const Placeholder: Story = {
  render: () => <PlaceholderDemo />,
};

export const Fallback: Story = {
  render: () => <FallbackDemo />,
};

export const Preview: Story = {
  render: () => <PreviewDemo />,
};

export const PreviewGroup: Story = {
  parameters: { layout: "padded" },
  render: () => <PreviewGroupDemo />,
};

export const PreviewGroupItems: Story = {
  parameters: { layout: "padded" },
  render: () => <PreviewGroupItemsDemo />,
};

export const PreviewOverlay: Story = {
  render: () => <ImagePreviewDemo />,
};

export const Gallery: Story = {
  render: () => <GalleryLightboxDemo />,
};

export const Gallery_Full: Story = {
  name: "Media Gallery",
  parameters: { layout: "padded" },
  render: () => <MediaGalleryDemo />,
};

export const SeekableVideo: Story = {
  parameters: { layout: "padded" },
  render: () => <SeekableVideoDemo />,
};

export const VideoSync: Story = {
  parameters: { layout: "padded" },
  render: () => <VideoSyncDemo />,
};

export const MosaicLayouts: Story = {
  parameters: { layout: "padded" },
  render: () => <MediaGalleryLayoutsDemo />,
};

// Interaction Testing - clicking a `preview` image mounts the overlay copy
export const InteractionPreview: Story = {
  args: {
    src: inlineSource,
    alt: "Clickable thumbnail",
    preview: true,
    width: 200,
    height: 140,
    className: "overflow-hidden rounded-lg",
    // Keep the box stable in the test run even before the network settles.
    placeholder: null,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("only the thumbnail is rendered initially", async () => {
      await expect(canvas.getAllByRole("img")).toHaveLength(1);
    });

    await step("clicking the thumbnail opens the overlay", async () => {
      await userEvent.click(canvas.getByAltText("Clickable thumbnail"));

      // The overlay renders a second copy of the same source on top.
      await expect(await canvas.findAllByRole("img")).toHaveLength(2);
    });
  },
};
