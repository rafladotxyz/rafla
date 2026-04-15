import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Group by winner, count wins and sum prizes
    const results = await prisma.gameResult.groupBy({
      by: ["winnerId"],
      _count: { winnerId: true },
      orderBy: { _count: { winnerId: "desc" } },
      take: 20,
    });

    const winnerIds = results.map((r) => r.winnerId);
    const users = await prisma.user.findMany({
      where: { id: { in: winnerIds } },
      select: { id: true, wallet: true, username: true, avatar: true },
    });

    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

    const leaderboard = results.map((r, i) => ({
      rank: i + 1,
      user: userMap[r.winnerId],
      wins: r._count.winnerId,
      totalPrize: "0",
    }));

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("[leaderboard] error:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}
