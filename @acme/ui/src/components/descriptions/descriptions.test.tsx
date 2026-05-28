import React from "react";

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import {
  Descriptions,
  DescriptionsAvatar,
  DescriptionsItem,
  DescriptionsLabel,
  DescriptionsValue,
} from "./descriptions";

const { mockUseResponsive } = vi.hoisted(() => ({
  mockUseResponsive: vi.fn(),
}));

vi.mock("@acme/ui/hooks/use-responsive", () => ({
  useResponsive: mockUseResponsive,
}));

globalThis.React = React;

beforeEach(() => {
  cleanup();
  mockUseResponsive.mockReset();
  mockUseResponsive.mockReturnValue({
    xs: true,
    sm: true,
    md: true,
    lg: true,
    xl: true,
    xxl: true,
  });
});

describe("Descriptions", () => {
  test("renders compound descriptions as a responsive grid", () => {
    render(
      <Descriptions className="p-6 md:grid-cols-3">
        <DescriptionsItem className="col-span-2 md:col-span-1">
          <DescriptionsLabel>Tour</DescriptionsLabel>
          <DescriptionsValue
            truncate
            title="TF - Experience: Full Day Tokyo City Tour"
          >
            TF - Experience: Full Day Tokyo City Tour
          </DescriptionsValue>
        </DescriptionsItem>
      </Descriptions>,
    );

    const label = screen.getByText("Tour");
    const value = screen.getByText("TF - Experience: Full Day Tokyo City Tour");
    const item = label.parentElement;
    const root = item?.parentElement;

    expect(root).toHaveClass("grid");
    expect(root).toHaveClass("grid-cols-2");
    expect(root).toHaveClass("gap-x-8");
    expect(root).toHaveClass("gap-y-6");
    expect(root).toHaveClass("md:grid-cols-3");
    expect(root).toHaveClass("p-6");
    expect(item).toHaveClass("min-w-0");
    expect(item).toHaveClass("space-y-1");
    expect(item).toHaveClass("col-span-2");
    expect(label).toHaveClass("text-muted-foreground");
    expect(label).toHaveClass("text-sm");
    expect(label).not.toHaveClass("uppercase");
    expect(label).not.toHaveClass("tracking-[0.05em]");
    expect(value).toHaveClass("text-sm");
    expect(value).not.toHaveClass("font-medium");
    expect(value).toHaveClass("truncate");
    expect(value).toHaveAttribute(
      "title",
      "TF - Experience: Full Day Tokyo City Tour",
    );
  });

  test("supports muted values and compact avatars in compound descriptions", () => {
    render(
      <Descriptions>
        <DescriptionsItem>
          <DescriptionsLabel>Guide Name</DescriptionsLabel>
          <DescriptionsValue muted>
            <div className="flex items-center gap-2">
              <DescriptionsAvatar>K1</DescriptionsAvatar>
              <span>KODO Guide 1</span>
            </div>
          </DescriptionsValue>
        </DescriptionsItem>
      </Descriptions>,
    );

    const value = screen
      .getByText("KODO Guide 1")
      .closest("div")?.parentElement;
    const avatar = screen.getByText("K1");

    expect(value).toHaveClass("text-muted-foreground");
    expect(avatar).toHaveClass("h-6");
    expect(avatar).toHaveClass("w-6");
    expect(avatar).toHaveClass("rounded-full");
    expect(avatar).toHaveClass("bg-muted");
  });

  test("does not add extra wrapper gap when the horizontal non-bordered label already ends with a colon gap", () => {
    render(
      <Descriptions
        title="User Info"
        layout="horizontal"
        items={[
          {
            key: "username",
            label: "UserName",
            children: "Zhou Maomao",
          },
        ]}
      />,
    );

    const label = screen.getByText("UserName");
    const row = label.parentElement;

    expect(row).not.toHaveClass("gap-2");
  });

  test("adds wrapper gap when horizontal non-bordered disables colon", () => {
    render(
      <Descriptions
        title="User Info"
        layout="horizontal"
        colon={false}
        items={[
          {
            key: "username",
            label: "UserName",
            children: "Zhou Maomao",
          },
        ]}
      />,
    );

    const label = screen.getByText("UserName");
    const row = label.parentElement;

    expect(row).toHaveClass("gap-2");
  });

  test("keeps the horizontal non-bordered label and long content inline without breaking table cells", () => {
    render(
      <Descriptions
        title="User Info"
        layout="horizontal"
        items={[
          {
            key: "address",
            label: "Address",
            children:
              "No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China",
          },
        ]}
      />,
    );

    const label = screen.getByText("Address");
    const content = screen.getByText(
      "No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China",
    );
    const cell = label.closest("td");
    const row = label.parentElement;

    expect(cell).not.toHaveClass("flex");
    expect(row).toHaveClass("flex");
    expect(row).toHaveClass("items-baseline");
    expect(row).not.toHaveClass("gap-2");
    expect(content).toHaveClass("min-w-0");
    expect(content).toHaveClass("flex-1");
  });

  test("uses word-based wrapping for value cells", () => {
    render(
      <Descriptions
        layout="vertical"
        items={[
          {
            key: "tour",
            label: "Tour",
            children: "TF - Experience: Full Day Tokyo City Tour",
          },
        ]}
      />,
    );

    const content = screen.getByText(
      "TF - Experience: Full Day Tokyo City Tour",
    );
    const cell = content.closest("td");

    expect(cell).toHaveClass("break-words");
    expect(cell).not.toHaveClass("break-all");
  });

  test("uses medium spacing by default for vertical descriptions", () => {
    render(
      <Descriptions
        layout="vertical"
        items={[
          {
            key: "tour",
            label: "Tour",
            children: "Tokyo City Tour",
          },
        ]}
      />,
    );

    const labelCell = screen.getByText("Tour").closest("th");
    const valueCell = screen.getByText("Tokyo City Tour").closest("td");

    expect(labelCell).toHaveClass("pb-1");
    expect(valueCell).toHaveClass("gap-0");
    expect(valueCell).toHaveClass("pb-3");
  });

  test("moves the previous default vertical spacing to large", () => {
    render(
      <Descriptions
        layout="vertical"
        size="large"
        items={[
          {
            key: "tour",
            label: "Tour",
            children: "Tokyo City Tour",
          },
        ]}
      />,
    );

    const labelCell = screen.getByText("Tour").closest("th");
    const valueCell = screen.getByText("Tokyo City Tour").closest("td");

    expect(labelCell).toHaveClass("pb-2");
    expect(valueCell).toHaveClass("gap-1");
    expect(valueCell).toHaveClass("pb-4");
  });

  test("uses compact vertical spacing for small descriptions", () => {
    render(
      <Descriptions
        layout="vertical"
        size="small"
        items={[
          {
            key: "tour",
            label: "Tour",
            children: "Tokyo City Tour",
          },
        ]}
      />,
    );

    const labelCell = screen.getByText("Tour").closest("th");
    const valueCell = screen.getByText("Tokyo City Tour").closest("td");

    expect(labelCell).toHaveClass("pb-0");
    expect(valueCell).toHaveClass("gap-0");
    expect(valueCell).toHaveClass("pb-2");
  });

  test("fills the remaining columns for the last item in an incomplete horizontal row", () => {
    render(
      <Descriptions
        layout="horizontal"
        column={3}
        items={[
          {
            key: "username",
            label: "UserName",
            children: "Zhou Maomao",
          },
          {
            key: "phone",
            label: "Telephone",
            children: "1810000000",
          },
        ]}
      />,
    );

    const telephoneCell = screen.getByText("Telephone").closest("td");

    expect(telephoneCell).toHaveAttribute("colspan", "2");
  });

  test("fills the remaining columns when the last row has a single item", () => {
    render(
      <Descriptions
        layout="horizontal"
        column={2}
        items={[
          {
            key: "username",
            label: "UserName",
            children: "Zhou Maomao",
          },
          {
            key: "phone",
            label: "Telephone",
            children: "1810000000",
          },
          {
            key: "address",
            label: "Address",
            children:
              "No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China",
          },
        ]}
      />,
    );

    const addressCell = screen.getByText("Address").closest("td");

    expect(addressCell).toHaveAttribute("colspan", "2");
  });

  test("fills the remaining columns for the last item in an incomplete vertical row", () => {
    const { container } = render(
      <Descriptions
        layout="vertical"
        column={3}
        items={[
          {
            key: "username",
            label: "UserName",
            children: "Zhou Maomao",
          },
          {
            key: "address",
            label: "Address",
            children:
              "No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China",
          },
        ]}
      />,
    );

    const rows = container.querySelectorAll("tbody tr");
    const labelCell = screen.getByText("Address").closest("th");
    const valueCell = screen
      .getByText(
        "No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China",
      )
      .closest("td");

    expect(rows).toHaveLength(2);
    expect(labelCell).toHaveAttribute("colspan", "2");
    expect(valueCell).toHaveAttribute("colspan", "2");
  });

  test("uses responsive default columns when column is omitted", () => {
    mockUseResponsive.mockReturnValue({
      xs: true,
      sm: false,
      md: false,
      lg: false,
      xl: false,
      xxl: false,
    });

    const { container } = render(
      <Descriptions
        layout="horizontal"
        items={[
          {
            key: "username",
            label: "UserName",
            children: "Zhou Maomao",
          },
          {
            key: "telephone",
            label: "Telephone",
            children: "1810000000",
          },
        ]}
      />,
    );

    const rows = container.querySelectorAll("tbody tr");

    expect(rows).toHaveLength(2);
  });
});
