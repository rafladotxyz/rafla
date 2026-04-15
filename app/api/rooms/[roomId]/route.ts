import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { roomId: string } },
) {
  try {
    const room = await prisma.gameRoom.findUnique({
      where: { id: params.roomId },
      include: {
        creator: {
          select: { id: true, wallet: true, username: true, avatar: true },
        },
        participants: {
          include: {
            user: {
              select: { id: true, wallet: true, username: true, avatar: true },
            },
          },
          orderBy: { joinedAt: "asc" },
        },
        result: {
          include: {
            winner: {
              select: { id: true, wallet: true, username: true, avatar: true },
            },
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: "room not found" }, { status: 404 });
    }

    return NextResponse.json({
      room: {
        ...room,
        contractRound: room.contractRound?.toString() ?? null,
      },
    });
  } catch (error) {
    console.error("[rooms/[roomId]] error:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}
