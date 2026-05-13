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
    const { gameType, stakeAmount, txHash, won, prizeAmount, contractRound } = body;

    if (!gameType || !stakeAmount || !txHash) {
      return NextResponse.json(
        { error: "gameType, stakeAmount and txHash are required" },
        { status: 400 },
      );
    }

    // Create a completed game room for this instant play
    const room = await prisma.gameRoom.create({
      data: {
        gameType,
        stakeAmount: String(stakeAmount),
        contractRound: contractRound ? BigInt(contractRound) : 0,
        status: "completed",
        creatorId: auth.userId,
        participants: {
          create: {
            userId: auth.userId,
            txHash,
          },
        },
        // If won, create the result in the same transaction
        result: won ? {
          create: {
            winnerId: auth.userId,
            prizeAmount: String(prizeAmount),
            txHash: txHash, // Reuse same txHash or vrf one if available
          }
        } : undefined,
      },
    });

    // Also record the deposit transaction
    await prisma.transaction.create({
      data: {
        userId: auth.userId,
        type: "deposit",
        amount: String(stakeAmount),
        txHash,
        chainId: 84532,
      },
    });

    // If won, record the win transaction
    if (won) {
      await prisma.transaction.create({
        data: {
          userId: auth.userId,
          type: "win",
          amount: String(prizeAmount),
          txHash,
          chainId: 84532,
        },
      });
    }

    return NextResponse.json({ ok: true, roomId: room.id });
  } catch (error) {
    console.error("[games/record] error:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}
