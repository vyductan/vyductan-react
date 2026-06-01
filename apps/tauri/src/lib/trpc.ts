import { getSessionToken } from "./auth";

const BASE_URL = "https://vyductan.dev";

export async function trpcRequest<T = any>(
  procedureName: string,
  method: "GET" | "POST",
  input?: any
): Promise<T> {
  const sessionToken = await getSessionToken();
  const headers: Record<string, string> = {
    "x-trpc-source": "tauri",
  };

  if (sessionToken) {
    headers["Authorization"] = `Bearer ${sessionToken}`;
  }

  let url = `${BASE_URL}/api/trpc/${procedureName}`;
  const options: RequestInit = {
    method,
    headers,
  };

  if (method === "GET") {
    if (input !== undefined) {
      // SuperJSON payload wrapping
      const wrapped = { json: input };
      url += `?input=${encodeURIComponent(JSON.stringify(wrapped))}`;
    }
  } else {
    headers["Content-Type"] = "application/json";
    // SuperJSON payload wrapping
    options.body = JSON.stringify({ json: input || {} });
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`tRPC request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error.message || "tRPC error");
  }

  // Extract from SuperJSON format
  return data.result?.data?.json as T;
}
