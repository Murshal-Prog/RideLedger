import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-server";
import { UserRepository } from "@/lib/repositories/user-repository";
import { updateProfileSchema } from "@/lib/validations/user-profile";

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return unauthorizedResponse();

  const profile = await UserRepository.getProfile(userId);
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  return NextResponse.json({ profile });
}

export async function PUT(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return unauthorizedResponse();

  try {
    const body = await req.json();
    const validated = updateProfileSchema.parse(body);
    const updated = await UserRepository.updateProfile(userId, validated);
    return NextResponse.json({ profile: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid profile update data";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
