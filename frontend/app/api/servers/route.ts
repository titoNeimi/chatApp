import { NextRequest, NextResponse } from "next/server";
import { authenticatedBackendRequest, backendRequest, createProxyResponse } from "@/lib/backendAuth";

type CreateServerPayload = {
  name: string;
  description?: string;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  let payload: CreateServerPayload;
  try {
    payload = (await request.json()) as CreateServerPayload;
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const { backendResponse, tokenPair, clearCookies } = await authenticatedBackendRequest(request, "/server", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return createProxyResponse(backendResponse, tokenPair, clearCookies);
}
