import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { pusher, roomChannel, PUSHER_EVENTS } from "@/lib/pusher";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> },
) {
  const auth = await requireAuth(req);
  const { roomId } = await params;
  if (!auth) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { txHash } = body;

    const room = await prisma.gameRoom.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json({ error: "room not found" }, { status: 404 });
    }

    if (room.status === "completed" || room.status === "cancelled") {
      return NextResponse.json(
        { error: "room is no longer active" },
        { status: 400 },
      );
    }

    // Upsert participant (idempotent — safe to call again if tx updates)
    const participant = await prisma.roomParticipant.upsert({
      where: {
        roomId_userId: { roomId: roomId, userId: auth.userId },
      },
      update: { txHash: txHash ?? undefined },
      create: {
        roomId: roomId,
        userId: auth.userId,
        txHash: txHash ?? null,
      },
      include: {
        user: {
          select: { id: true, wallet: true, username: true, avatar: true },
        },
      },
    });

    // Record deposit transaction
    if (txHash) {
      await prisma.transaction
        .upsert({
          where: { id: `${auth.userId}-${txHash}` },
          update: {},
          create: {
            id: `${auth.userId}-${txHash}`,
            userId: auth.userId,
            type: "deposit",
            amount: room.stakeAmount,
            txHash,
            chainId: 84532, // Base Sepolia
          },
        })
        .catch(() => {
          // ignore duplicate tx errors
        });
    }

    // Get updated participant count
    const participantCount = await prisma.roomParticipant.count({
      where: { roomId: roomId },
    });

    // Broadcast to room channel
    await pusher.trigger(roomChannel(roomId), PUSHER_EVENTS.PLAYER_JOINED, {
      participant: {
        userId: participant.userId,
        wallet: participant.user.wallet,
        username: participant.user.username,
        avatar: participant.user.avatar,
        txHash: participant.txHash,
        joinedAt: participant.joinedAt,
      },
      totalPlayers: participantCount,
    });

    return NextResponse.json({
      ok: true,
      participant,
      totalPlayers: participantCount,
    });
  } catch (error) {
    console.error("[rooms/join] error:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}
