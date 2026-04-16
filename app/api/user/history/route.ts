import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    // Get all rooms the user participated in
    const participations = await prisma.roomParticipant.findMany({
      where: { userId: auth.userId },
      include: {
        room: {
          include: {
            result: true,
          },
        },
      },
      orderBy: { joinedAt: "desc" },
      take: 50,
    });

    const history = participations.map((p) => ({
      id: p.id,
      roomId: p.roomId,
      gameType: p.room.gameType,
      joinedAt: p.joinedAt,
      stakeAmount: p.room.stakeAmount,
      isWin: p.room.result?.winnerId === auth.userId,
      prizeAmount: p.room.result?.prizeAmount ?? "0",
      settledAt: p.room.result?.settledAt ?? p.joinedAt,
      status: p.room.status,
      txHash: p.txHash,
    }));

    return NextResponse.json({ history });
  } catch (error) {
    console.error("[user/history] error:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}
