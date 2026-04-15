import { NextRequest, NextResponse } from "next/server";
import { SiweMessage } from "siwe";
import { prisma } from "@/lib/prisma";
import { signJWT } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, signature } = body;

    if (!message || !signature) {
      return NextResponse.json(
        { error: "message and signature are required" },
        { status: 400 },
      );
    }

    // Parse and verify the SIWE message
    const siweMessage = new SiweMessage(message);
    const { data: fields, error } = await siweMessage.verify({ signature });

    if (error || !fields) {
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }

    const wallet = fields.address.toLowerCase();

    // Check nonce exists and hasn't expired
    const storedNonce = await prisma.nonce.findFirst({
      where: {
        wallet,
        nonce: fields.nonce,
        expiresAt: { gt: new Date() },
      },
    });

    if (!storedNonce) {
      return NextResponse.json(
        { error: "invalid or expired nonce" },
        { status: 401 },
      );
    }

    // Delete used nonce
    await prisma.nonce.delete({ where: { id: storedNonce.id } });

    // Upsert user — create on first login
    const user = await prisma.user.upsert({
      where: { wallet },
      update: {}, // don't overwrite anything on subsequent logins
      create: {
        wallet,
        username: null,
        avatar: null,
      },
    });

    // Sign JWT
    const token = await signJWT({ wallet, userId: user.id });

    // Build response with JWT in cookie AND body
    // Cookie: for SSR/middleware · Body: for client-side storage
    const response = NextResponse.json({
      ok: true,
      token,
      user: {
        id: user.id,
        wallet: user.wallet,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        twitter: user.twitter,
        telegram: user.telegram,
      },
    });

    response.cookies.set("rafla_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error(
      "[verify] error:",
      error instanceof Error ? error.message : error,
    );
    console.error(
      "[verify] stack:",
      error instanceof Error ? error.stack : "no stack",
    );
    console.error("[verify] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
