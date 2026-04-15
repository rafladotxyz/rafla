import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { pusher, roomChannel, PUSHER_EVENTS } from "@/lib/pusher";

export async function POST(
  req: NextRequest,
  { params }: { params: { roomId: string } },
) {
  // settle can be called by any authenticated participant (or a backend job)
  const auth = await requireAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { winnerWallet, prizeAmount, vrfRequestId, txHash } = body;

    if (!winnerWallet || !prizeAmount || !txHash) {
      return NextResponse.json(
        { error: "winnerWallet, prizeAmount and txHash are required" },
        { status: 400 },
      );
    }

    const room = await prisma.gameRoom.findUnique({
      where: { id: params.roomId },
    });

    if (!room) {
      return NextResponse.json({ error: "room not found" }, { status: 404 });
    }

    if (room.status === "completed") {
      return NextResponse.json(
        { error: "room already settled" },
        { status: 400 },
      );
    }

    // Find winner user by wallet
    const winner = await prisma.user.findUnique({
      where: { wallet: winnerWallet.toLowerCase() },
    });

    if (!winner) {
      return NextResponse.json(
        { error: "winner wallet not found in DB" },
        { status: 404 },
      );
    }

    // Update room status + create result in a transaction
    const [updatedRoom, result] = await prisma.$transaction([
      prisma.gameRoom.update({
        where: { id: params.roomId },
        data: { status: "completed" },
      }),
      prisma.gameResult.create({
        data: {
          roomId: params.roomId,
          winnerId: winner.id,
          vrfRequestId: vrfRequestId ? String(vrfRequestId) : null,
          txHash,
          prizeAmount: String(prizeAmount),
        },
      }),
      prisma.transaction.create({
        data: {
          userId: winner.id,
          type: "win",
          amount: String(prizeAmount),
          txHash,
          chainId: 84532,
        },
      }),
    ]);

    // Broadcast result to room
    await pusher.trigger(
      roomChannel(params.roomId),
      PUSHER_EVENTS.RESULT_REVEALED,
      {
        winnerId: winner.id,
        winnerWallet: winner.wallet,
        winnerUsername: winner.username,
        prizeAmount,
        txHash,
        vrfRequestId,
      },
    );

    return NextResponse.json({ ok: true, result, room: updatedRoom });
  } catch (error) {
    console.error("[rooms/settle] error:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}
