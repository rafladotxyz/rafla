import { NextRequest, NextResponse } from "next/server";
import { pusher } from "@/lib/pusher";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.text();
    const params = new URLSearchParams(body);
    const socketId = params.get("socket_id");
    const channelName = params.get("channel_name");

    if (!socketId || !channelName) {
      return NextResponse.json(
        { error: "socket_id and channel_name are required" },
        { status: 400 },
      );
    }

    const authResponse = pusher.authorizeChannel(socketId, channelName, {
      user_id: auth.userId,
      user_info: { wallet: auth.wallet },
    });

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error("[pusher/auth] error:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}
