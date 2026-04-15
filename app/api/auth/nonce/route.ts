import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateNonce } from "siwe";

export async function GET(req: NextRequest) {
  try {
    const wallet = req.nextUrl.searchParams.get("wallet");

    if (!wallet) {
      return NextResponse.json(
        { error: "wallet address is required" },
        { status: 400 },
      );
    }

    const nonce = generateNonce();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Clean up old nonces for this wallet first
    await prisma.nonce.deleteMany({ where: { wallet: wallet.toLowerCase() } });

    await prisma.nonce.create({
      data: {
        nonce,
        wallet: wallet.toLowerCase(),
        expiresAt,
      },
    });

    return NextResponse.json({ nonce });
  } catch (error) {
    console.error("[nonce] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
