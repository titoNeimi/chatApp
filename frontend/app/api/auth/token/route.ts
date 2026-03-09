import { NextRequest, NextResponse } from "next/server";
import { authenticatedBackendRequest } from "@/lib/backendAuth";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const result = await authenticatedBackendRequest(request, "/auth/me");

  if (result.backendResponse.status === 401) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    { token: result.accessTokenUsed },
    { status: 200 }
  );
}
