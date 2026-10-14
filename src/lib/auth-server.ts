import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { StorageAdapter, SecurityError } from "@/lib/repositories/storage-adapter";
import { DEMO_USER } from "@/lib/repositories/auth-repository";

export async function getAuthenticatedUserId(req: NextRequest): Promise<string | null> {
  // 1. Supabase SSR check if configured
  if (isSupabaseConfigured) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return req.cookies.getAll().map((c) => ({ name: c.name, value: c.value }));
          },
          setAll() {},
        },
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) return user.id;
    } catch {
      // fallback to header / local storage
    }
  }

  // 2. Request header check (e.g. for testing / client-driven isolated requests)
  const headerUserId = req.headers.get("x-user-id");
  if (headerUserId) return headerUserId;

  // 3. Fallback stored session
  const stored = StorageAdapter.getStoredAuthSession();
  if (stored?.userId) return stored.userId;

  return null;
}

export function unauthorizedResponse(message = "Unauthorized: Valid authentication required") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message = "Forbidden: User isolation violation") {
  return NextResponse.json({ error: message }, { status: 403 });
}
