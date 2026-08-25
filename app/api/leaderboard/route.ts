import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const RANGES = ["all", "monthly", "weekly"] as const;
type Range = (typeof RANGES)[number];

function rangeStart(range: Range): Date | null {
  const now = new Date();
  if (range === "weekly") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return d;
  }
  if (range === "monthly") {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 1);
    return d;
  }
  return null;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const param = url.searchParams.get("range") ?? "all";
    const range: Range = (RANGES as readonly string[]).includes(param)
      ? (param as Range)
      : "all";
    const since = rangeStart(range);

    // Group by winner, count wins and sum prizes
    const results = await prisma.gameResult.groupBy({
      by: ["winnerId"],
      where: since ? { settledAt: { gte: since } } : undefined,
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
    const prizeRows = await prisma.gameResult.findMany({
      where: {
        winnerId: { in: winnerIds },
        ...(since ? { settledAt: { gte: since } } : {}),
      },
      select: {
        winnerId: true,
        prizeAmount: true,
        room: {
          select: {
            token: true,
          },
        },
      },
    });

    const totalPrizeByWinner = prizeRows.reduce<Record<string, number>>(
      (acc, row) => {
        const raw = Number(row.prizeAmount);
        if (!isNaN(raw)) {
          const decimals = row.room?.token === "USDC" ? 6 : 18;
          const humanAmount = raw / 10 ** decimals;
          acc[row.winnerId] = (acc[row.winnerId] ?? 0) + humanAmount;
        }
        return acc;
      },
      {},
    );

    const leaderboard = results.map((r, i) => ({
      rank: i + 1,
      user: userMap[r.winnerId],
      wins: r._count.winnerId,
      totalPrize: String(totalPrizeByWinner[r.winnerId] ?? 0),
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
