import { db } from "./db";

const BASE_URL = "https://vyductan.dev";

export async function getSessionToken(): Promise<string | null> {
  const metadata = await db.syncMetadata.get("sessionToken");
  return metadata ? metadata.value : null;
}

export async function setSessionToken(token: string): Promise<void> {
  await db.syncMetadata.put({ key: "sessionToken", value: token });
}

export async function clearSessionToken(): Promise<void> {
  await db.syncMetadata.delete("sessionToken");
  await db.syncMetadata.delete("supabaseToken");
  await db.syncMetadata.delete("lastSyncTime");
}

export async function getSupabaseToken(): Promise<string | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  // Check if we have a valid cached Supabase token
  const cached = await db.syncMetadata.get("supabaseToken");
  if (cached) {
    // Basic JWT expiration check (1 hour lifetime)
    try {
      const payload = JSON.parse(atob(cached.value.split(".")[1]));
      const exp = payload.exp * 1000;
      // If it has at least 5 minutes left, reuse it
      if (exp - Date.now() > 5 * 60 * 1000) {
        return cached.value;
      }
    } catch (e) {
      console.error("Error parsing cached Supabase JWT", e);
    }
  }

  // Fetch a new Supabase token from vyductan.dev
  try {
    const response = await fetch(`${BASE_URL}/api/auth/supabase-token`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Session token expired
        await clearSessionToken();
      }
      return null;
    }

    const data = await response.json();
    if (data.token) {
      await db.syncMetadata.put({ key: "supabaseToken", value: data.token });
      return data.token;
    }
  } catch (error) {
    console.error("Failed to fetch Supabase token:", error);
  }

  return null;
}

export function triggerBrowserLogin(): void {
  const loginUrl = `${BASE_URL}/api/auth/signin?callbackURL=${encodeURIComponent(
    `${BASE_URL}/api/auth/macos-callback`
  )}`;
  
  // Try to use Tauri's opener plugin if available, otherwise fallback to window.open
  try {
    import("@tauri-apps/plugin-opener").then(({ openUrl }) => {
      openUrl(loginUrl).catch((err: any) => {
        console.error("Opener failed:", err);
        window.open(loginUrl, "_blank");
      });
    });
  } catch (e) {
    window.open(loginUrl, "_blank");
  }
}
