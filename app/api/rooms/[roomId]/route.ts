import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> },
) {
  const { roomId } = await params;
  try {
    const room = await prisma.gameRoom.findUnique({
      where: { id: roomId },
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
      // Return a 200 OK but with a 'status: "new"' or null participants
      return NextResponse.json({
        room: {
          id: roomId,
          status: "waiting",
          participants: [], // This tells the hook there are no players yet
          isNew: true,
        },
      });
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
