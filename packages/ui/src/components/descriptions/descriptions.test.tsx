import React from "react";

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { Descriptions } from "./descriptions";

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
    cleanup();

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
