import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-server";
import { UserRepository } from "@/lib/repositories/user-repository";

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return unauthorizedResponse();

  const profile = await UserRepository.getProfile(userId);
  return NextResponse.json({
    user: { id: userId },
    profile,
  });
}
