import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const src = url.searchParams.get("src");
    const from = url.searchParams.get("from");

    if (!src) {
      return new Response("Missing src", { status: 400 });
    }

    let absolutePath: string | undefined;

    if (src.startsWith(".")) {
      if (typeof from === "string") {
        const base = new URL(from);
        const resolved = new URL(src, base);
        absolutePath = fileURLToPath(resolved);
      } else {
        absolutePath = path.resolve(process.cwd(), src);
      }
    } else if (path.isAbsolute(src)) {
      absolutePath = src;
    } else {
      // treat as workspace-relative path
      absolutePath = path.resolve(process.cwd(), src);
    }

    if (!absolutePath || !fs.existsSync(absolutePath)) {
      return new Response("", {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const content = fs.readFileSync(absolutePath, "utf8");
    return new Response(content, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch {
    return new Response("", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
