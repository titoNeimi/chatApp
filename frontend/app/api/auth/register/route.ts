import { NextRequest, NextResponse } from "next/server";
import { backendRequest, createProxyResponse } from "@/lib/backendAuth";

type RegisterPayload = {
  email: string;
  username: string;
  password: string;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  let payload: RegisterPayload;
  try {
    payload = (await request.json()) as RegisterPayload;
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const backendResponse = await backendRequest("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return createProxyResponse(backendResponse, null, false);
}
