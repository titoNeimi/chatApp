import { NextRequest, NextResponse } from "next/server";
import { authenticatedBackendRequest, createProxyResponse } from "@/lib/backendAuth";

type RouteContext = {
  params: Promise<{ roomID: string }>;
};

export async function GET(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { roomID } = await context.params;
  if (!roomID) {
    return NextResponse.json({ message: "roomID is required" }, { status: 400 });
  }
  const result = await authenticatedBackendRequest(request, `/room/${roomID}/users`);
  return createProxyResponse(result.backendResponse, result.tokenPair, result.clearCookies);
}
