import { Card } from "@/components/ui/card";

import { CollapsibleCodeBlock } from "./collapsible-code-block";

type CompDemoProps = {
  src: string;
  __comp__: React.FC;
};

const ComponentSource = ({ src, __comp__ }: CompDemoProps) => {
  // Component source code display for Storybook
  // Note: File reading happens at build time via Storybook's source loader addon
  // The 'src' prop is used for reference/display purposes only

  let language = "tsx";

  if (typeof src === "string") {
    const extension = src.split(".").pop();
    language =
      extension === "ts" || extension === "tsx" ? "tsx" : (extension ?? "tsx");
  }

  // The actual source code will be provided by Storybook's source addon
  // For now, use the src path as placeholder content
  const content = typeof src === "string" ? src : "";

  // Dynamic import không thể dùng với biến - cần static string literal
  // Giải pháp: Dùng __comp__ prop đã được pass vào (đơn giản nhất)

  return (
    <Card className="mt-6 inline-flex w-full flex-col sm:max-w-3xl">
      <CollapsibleCodeBlock
        component={<__comp__ />}
        language={language}
        content={content}
      />
    </Card>
  );
};

// Nếu muốn dùng dynamic import với variable paths, bạn cần tạo mapping như sau:
// function getComponentLoader(componentPath: string) {
//   const componentMap: Record<string, () => Promise<{ default: React.FC }>> = {
//     "@/components/ui/alert-modal/demo/basic": () =>
//       import("@/components/ui/alert-modal/demo/basic"),
//     // Thêm các component khác vào đây với static imports
//   };
//   return componentMap[componentPath];
// }
// Sau đó sử dụng: const ComponentLoader = getComponentLoader(componentPath);
//                  const Comp = ComponentLoader ? dynamic(() => ComponentLoader) : null;

export { ComponentSource };
