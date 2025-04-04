// Dec 30, 2024, 12:20 PM GMT+7
// https://github.com/ant-design/ant-design/commit/993d514af38f40935ab9a3382ad6eaf88565aede

import React from "react";
import { render, unmount } from "@rc-component/util/lib/React/render";
import ReactDOM from "react-dom";

import warning from "../_util/warning";

export type UnmountType = () => Promise<void>;
export type RenderType = (
  node: React.ReactElement,
  container: Element | DocumentFragment,
) => UnmountType;

const defaultReactRender: RenderType = (node, container) => {
  // TODO: Remove in v6
  // Warning for React 19
  if (process.env.NODE_ENV !== "production") {
    const majorVersion = Number.parseInt(
      React.version.split(".")[0] ?? "0",
      10,
    );
    const fullKeys = Object.keys(ReactDOM);

    warning(
      majorVersion < 19 || fullKeys.includes("createRoot"),
      "compatible",
      "antd v5 support React is 16 ~ 18. see https://u.ant.design/v5-for-19 for compatible.",
    );
  }

  render(node, container);
  return () => {
    return unmount(container);
  };
};

let unstableRender: RenderType = defaultReactRender;

/**
 * @deprecated Set React render function for compatible usage.
 * This is internal usage only compatible with React 19.
 * And will be removed in next major version.
 */
export function unstableSetRender(render: RenderType) {
  unstableRender = render;
}

export function getReactRender() {
  return unstableRender;
}
