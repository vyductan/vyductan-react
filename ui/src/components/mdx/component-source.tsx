import fs from "node:fs";
import path from "node:path";
import { Card } from "@/components/ui/card";

import { CollapsibleCodeBlock } from "./collapsible-code-block";

type CompDemoProps = {
  src: string;
  __comp__: React.FC;
};

const ComponentSource = ({ src, __comp__ }: CompDemoProps) => {
  // const [code, setCode] = useState("");

  // useEffect(() => {
  //   let aborted = false;
  //   const params = new URLSearchParams();
  //   if (src) params.set("src", src);
  //   if (from) params.set("from", from);

  //   fetch(`/api/code?${params.toString()}`)
  //     .then((r) => r.text())
  //     .then((t) => {
  //       if (!aborted) setCode(t || (typeof src === "string" ? src : ""));
  //     })
  //     .catch(() => {
  //       if (!aborted) setCode(typeof src === "string" ? src : "");
  //     });

  //   return () => {
  //     aborted = true;
  //   };
  // }, [src, from]);

  let fileContent = "";
  let absolutePath = "";
  let componentPath = "";
  let language = "";

  if (typeof src === "string") {
    try {
      absolutePath = path.resolve(
        process.cwd(),
        "../../@acme/ui/src/components/" + src,
      );
      componentPath = "@/components/ui/" + src.replace(".tsx", "");
      language = src.split(".")[1] ?? "tsx";
      if (absolutePath && fs.existsSync(absolutePath)) {
        fileContent = fs.readFileSync(absolutePath, "utf8");
      }

      // if (src.startsWith(".")) {
      //   if (typeof from === "string") {
      //     const url = new URL(src, from);
      //     absolutePath = fileURLToPath(url);
      //   } else {
      //     absolutePath = path.resolve(process.cwd(), src);
      //   }
      // } else if (path.isAbsolute(src)) {
      //   absolutePath = src;
      // }

      // if (absolutePath && fs.existsSync(absolutePath)) {
      //   fileContent = fs.readFileSync(absolutePath, "utf8");
      // }
      console.log(
        "fileContent",
        componentPath,
        // fileContent,
        // absolutePath,
        // process.cwd(),
        // path.resolve(process.cwd(), "../../@acme/ui/src/components/" + src),
      );
    } catch {
      // ignore and fallback
    }
  }

  const content = fileContent || (typeof src === "string" ? src : "");

  // Dynamic import không thể dùng với biến - cần static string literal
  // Giải pháp: Dùng __comp__ prop đã được pass vào (đơn giản nhất)

  return (
    <Card className="mt-6 inline-flex w-full flex-col sm:max-w-1/2">
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
