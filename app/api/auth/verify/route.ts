import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signJWT } from "@/lib/jwt";
import { createPublicClient, http, verifyMessage } from "viem";
import { baseSepolia, base } from "viem/chains";

// Public clients for on-chain ERC-6492 signature verification
const publicClientSepolia = createPublicClient({
  chain: baseSepolia,
  transport: http("https://sepolia.base.org"),
});

const publicClientBase = createPublicClient({
  chain: base,
  transport: http("https://mainnet.base.org"),
});

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

    // Parse the SIWE message to extract fields
    // We don't use siwe.verify() because it uses ethers.js which rejects
    // ERC-6492 signatures from Coinbase Smart Wallet / Safe wallets
    const { SiweMessage } = await import("siwe");
    let siweMessage: InstanceType<typeof SiweMessage>;

    try {
      siweMessage = new SiweMessage(message);
    } catch (parseErr) {
      console.error("[verify] siwe parse error:", parseErr);
      return NextResponse.json(
        { error: "invalid SIWE message format" },
        { status: 400 },
      );
    }

    const address = siweMessage.address as `0x${string}`;
    const nonce = siweMessage.nonce;
    const chainId = siweMessage.chainId;

    // Use viem verifyMessage which fully supports ERC-6492
    // (undeployed smart contract wallets like Coinbase Smart Wallet)
    const client = chainId === 8453 ? publicClientBase : publicClientSepolia;

    let isValid = false;
    try {
      isValid = await verifyMessage({
        address,
        message,
        signature: signature as `0x${string}`,
        publicClient: client,
      } as Parameters<typeof verifyMessage>[0]);
    } catch (verifyErr) {
      console.error("[verify] viem verifyMessage error:", verifyErr);
      return NextResponse.json(
        { error: "signature verification failed" },
        { status: 401 },
      );
    }

    if (!isValid) {
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }

    const wallet = address.toLowerCase();

    // Validate nonce
    const storedNonce = await prisma.nonce.findFirst({
      where: {
        wallet,
        nonce,
        expiresAt: { gt: new Date() },
      },
    });

    if (!storedNonce) {
      return NextResponse.json(
        { error: "invalid or expired nonce — please try signing in again" },
        { status: 401 },
      );
    }

    await prisma.nonce.delete({ where: { id: storedNonce.id } });

    // Upsert user
    const user = await prisma.user.upsert({
      where: { wallet },
      update: {},
      create: { wallet, username: null, avatar: null },
    });

    const token = await signJWT({ wallet, userId: user.id });

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
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[verify] unhandled error:", error);
    return NextResponse.json(
      {
        error: "internal server error",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
