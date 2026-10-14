import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-server";
import { WorkSessionRepository } from "@/lib/repositories/work-session-repository";
import { startSessionSchema, endSessionSchema } from "@/lib/validations/work-session";

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const activeOnly = searchParams.get("active") === "true";

  if (activeOnly) {
    const active = await WorkSessionRepository.getActiveSession(userId);
    return NextResponse.json({ session: active });
  }

  const sessions = await WorkSessionRepository.listSessions(userId);
  return NextResponse.json({ sessions });
}

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return unauthorizedResponse();

  try {
    const body = await req.json();
    const validated = startSessionSchema.parse(body);
    const session = await WorkSessionRepository.startSession(userId, validated);
    return NextResponse.json({ session }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to start session";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { sessionId, ...endData } = body;
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }
    const validated = endSessionSchema.parse(endData);
    const session = await WorkSessionRepository.endSession(userId, sessionId, validated);
    return NextResponse.json({ session });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to conclude session";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
