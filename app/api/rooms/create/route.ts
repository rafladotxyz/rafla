import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { gameType, stakeAmount, drawTime, contractRound } = body;

    if (!gameType || !stakeAmount) {
      return NextResponse.json(
        { error: "gameType and stakeAmount are required" },
        { status: 400 },
      );
    }

    if (!["spin", "flip", "draw"].includes(gameType)) {
      return NextResponse.json({ error: "invalid gameType" }, { status: 400 });
    }

    const room = await prisma.gameRoom.create({
      data: {
        gameType,
        stakeAmount: String(stakeAmount),
        contractRound: contractRound ? BigInt(contractRound) : 0,
        drawTime: drawTime ? new Date(drawTime) : null,
        status: "waiting",
        creatorId: auth.userId,
      },
      include: {
        creator: {
          select: { id: true, wallet: true, username: true, avatar: true },
        },
      },
    });

    return NextResponse.json({
      room: {
        ...room,
        contractRound: room.contractRound?.toString() ?? null,
      },
    });
  } catch (error) {
    console.error("[rooms/create] error:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}
