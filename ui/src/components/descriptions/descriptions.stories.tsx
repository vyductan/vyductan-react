import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ReactElement } from "react";

import { Descriptions } from ".";

const descriptionItems = [
  {
    key: "1",
    label: "UserName",
    children: "Zhou Maomao",
  },
  {
    key: "2",
    label: "Telephone",
    children: "1810000000",
  },
  {
    key: "3",
    label: "Live",
    children: "Hangzhou, Zhejiang",
  },
  {
    key: "4",
    label: "Remark",
    children: "empty",
  },
  {
    key: "5",
    label: "Address",
    children: "No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China",
  },
];

const descriptionsTitle = "User Info";

const meta = {
  title: "Components/Descriptions",
  component: Descriptions,
  args: {
    items: descriptionItems,
  },
} satisfies Meta<typeof Descriptions>;

export default meta;
type Story = StoryObj<typeof meta>;

function renderSizeSection(size: "small" | "middle"): ReactElement {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-medium">size=&quot;{size}&quot;</h3>
      <Descriptions
        title={descriptionsTitle}
        size={size}
        // bordered
        layout="vertical"
        items={descriptionItems}
      />
    </section>
  );
}

function renderCompareSizes(): ReactElement {
  return (
    <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-2">
      {renderSizeSection("small")}
      {renderSizeSection("middle")}
    </div>
  );
}

function renderColonBehaviorVariant(
  heading: string,
  layout: "horizontal" | "vertical",
  colon?: boolean,
): ReactElement {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-medium">{heading}</h3>
      <Descriptions
        title={descriptionsTitle}
        layout={layout}
        colon={colon}
        items={descriptionItems}
      />
    </section>
  );
}

function renderCompareColonBehavior(): ReactElement {
  return (
    <div className="flex w-full max-w-6xl flex-col gap-6">
      {renderColonBehaviorVariant(
        "Horizontal / bordered=false / colon=false",
        "horizontal",
        false,
      )}
      {renderColonBehaviorVariant("Horizontal / bordered=false", "horizontal")}
      {renderColonBehaviorVariant("Vertical / bordered=false", "vertical")}
    </div>
  );
}

export const CompareSizes: Story = {
  render: renderCompareSizes,
};

export const CompareColonBehavior: Story = {
  render: renderCompareColonBehavior,
};
