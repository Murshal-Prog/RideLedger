import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-server";
import { RideRepository } from "@/lib/repositories/ride-repository";
import { createRideSchema } from "@/lib/validations/ride";

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const workSessionId = searchParams.get("workSessionId");

  const rides = await RideRepository.getRides(userId, workSessionId);
  return NextResponse.json({ rides });
}

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return unauthorizedResponse();

  try {
    const body = await req.json();
    const validated = createRideSchema.parse(body);
    const ride = await RideRepository.createRide(userId, validated);
    return NextResponse.json({ ride }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid ride data";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
