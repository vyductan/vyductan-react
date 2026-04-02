declare module "*.mdx" {
  import type { ComponentType } from "react";

  const MDXComponent: ComponentType<Record<string, never>>;
  export default MDXComponent;
}

declare module "jsdom" {
  export class JSDOM {
    window: { document: Document };
    constructor(html?: string);
  }
}
