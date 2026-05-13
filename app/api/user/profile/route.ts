import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
      id: true,
      wallet: true,
      username: true,
      avatar: true,
      bio: true,
      twitter: true,
      telegram: true,
      createdAt: true,
      _count: {
        select: {
          results: true, // total wins
          rooms: true, // total games played
          transactions: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "user not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  let { username, avatar, bio, twitter, telegram } = body;

  // Normalize username: lowercase and remove leading @
  if (username) {
    username = username.toLowerCase().trim();
    if (username.startsWith("@")) {
      username = username.slice(1);
    }
    
    // Check uniqueness
    const existing = await prisma.user.findFirst({
      where: { username, NOT: { id: auth.userId } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "username already taken" },
        { status: 409 },
      );
    }
  }

  const updated = await prisma.user.update({
    where: { id: auth.userId },
    data: {
      ...(username !== undefined && { username }),
      ...(avatar !== undefined && { avatar }),
      ...(bio !== undefined && { bio }),
      ...(twitter !== undefined && { twitter }),
      ...(telegram !== undefined && { telegram }),
    },
    select: {
      id: true,
      wallet: true,
      username: true,
      avatar: true,
      bio: true,
      twitter: true,
      telegram: true,
    },
  });

  return NextResponse.json({ user: updated });
}
