import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const p = await prisma.roomParticipant.findFirst({
      where: {
        id,
        userId: auth.userId,
      },
      include: {
        room: {
          include: {
            result: true,
          },
        },
      },
    });

    if (!p) {
      return NextResponse.json({ error: "history item not found" }, { status: 404 });
    }

    const item = {
      id: p.id,
      roomId: p.roomId,
      gameType: p.room.gameType,
      token: p.room.token,
      joinedAt: p.joinedAt,
      stakeAmount: p.room.stakeAmount,
      isWin: p.room.result?.winnerId === auth.userId,
      prizeAmount: p.room.result?.prizeAmount ?? "0",
      settledAt: p.room.result?.settledAt ?? p.joinedAt,
      status: p.room.status,
      txHash: p.txHash,
    };

    return NextResponse.json({ item });
  } catch (error) {
    console.error("[user/history/[id]] error:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}
