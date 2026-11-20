import type React from "react";

import { Card } from "@acme/ui/components/card";

import { CollapsibleCodeBlock } from "./collapsible-code-block";

type ComponentSourceProperties = {
  src: string;
  __comp__: React.FC;
};

// `import.meta.glob` is a compile-time Vite macro: the literal call below is
// statically replaced with a baked file map at build time. A runtime
// `typeof import.meta.glob === "function"` guard is always false in the browser
// (the bare property is never injected, only the call is rewritten), so it would
// silently discard the map. Call it directly and fall back to `{}` only in
// non-Vite runtimes (e.g. webpack/turbopack), where the call throws at runtime.
function loadExampleSources(): Record<string, string> {
  try {
    return import.meta.glob("../**/examples/*.{ts,tsx}", {
      query: "?raw",
      import: "default",
      eager: true,
    }) as Record<string, string>;
  } catch {
    return {};
  }
}

const exampleSourceFiles = loadExampleSources();

const ComponentSource = ({ src, __comp__ }: ComponentSourceProperties) => {
  let language = "tsx";

  if (typeof src === "string") {
    const extension = src.split(".").pop();
    language =
      extension === "ts" || extension === "tsx" ? "tsx" : (extension ?? "tsx");
  }

  const content =
    typeof src === "string" ? (exampleSourceFiles[`../${src}`] ?? src) : "";

  // Dynamic import cannot take a variable - it needs a static string literal
  // Solution: use the __comp__ prop that is passed in (simplest)

  return (
    <Card className="sb-unstyled mt-6 inline-flex w-full flex-col sm:max-w-3xl">
      <CollapsibleCodeBlock
        component={<__comp__ />}
        language={language}
        content={content}
      />
    </Card>
  );
};

// To use dynamic import with variable paths, build a mapping like this:
// function getComponentLoader(componentPath: string) {
//   const componentMap: Record<string, () => Promise<{ default: React.FC }>> = {
//     "@acme/ui/components/alert-modal/examples/basic": () =>
//       import("@acme/ui/components/alert-modal/examples/basic"),
//     // Add other components here with static imports
//   };
//   return componentMap[componentPath];
// }
// Then use: const ComponentLoader = getComponentLoader(componentPath);
//                  const Comp = ComponentLoader ? dynamic(() => ComponentLoader) : null;

export { ComponentSource };
