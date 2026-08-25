import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractBearer } from "./jwt";
import { createRemoteJWKSet, jwtVerify, type JWTPayload as JoseJWTPayload } from "jose";

export interface AuthContext {
  /** Database user id — safe to use as a foreign key. */
  userId: string;
  wallet: string;
}

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const privyAppSecret = process.env.PRIVY_APP_SECRET;

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks() {
  if (!privyAppId) return null;
  jwks ??= createRemoteJWKSet(
    new URL(`https://auth.privy.io/api/v1/apps/${privyAppId}/jwks.json`),
  );
  return jwks;
}

interface PrivyLinkedAccount {
  type: string;
  address?: string;
}

// Small TTL cache so we don't hit the Privy REST API on every request.
const walletCache = new Map<string, { wallet: string; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60_000;

async function resolveWallet(privyDid: string): Promise<string | null> {
  if (!privyAppId || !privyAppSecret) return null;

  const cached = walletCache.get(privyDid);
  if (cached && cached.expiresAt > Date.now()) return cached.wallet;

  try {
    const res = await fetch(
      `https://auth.privy.io/api/v1/apps/${privyAppId}/users/${privyDid}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${privyAppId}:${privyAppSecret}`,
          ).toString("base64")}`,
          "privy-app-id": privyAppId,
        },
      },
    );
    if (!res.ok) return null;

    const user = (await res.json()) as {
      linkedAccounts?: PrivyLinkedAccount[];
    };
    const wallet = user.linkedAccounts?.find(
      (a) => a.type === "wallet" && typeof a.address === "string",
    )?.address;
    if (!wallet) return null;

    walletCache.set(privyDid, {
      wallet: wallet.toLowerCase(),
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
    return wallet.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Verifies a Privy access token and returns the app's own user record.
 * Creates the user on first sight so every route can treat auth.userId
 * as a real database foreign key.
 */
export async function requireAuth(
  req: NextRequest,
): Promise<AuthContext | null> {
  const token = extractBearer(req.headers.get("authorization"));
  if (!token) return null;

  const remoteJwks = getJwks();
  if (!remoteJwks) return null;

  let payload: JoseJWTPayload;
  try {
    ({ payload } = await jwtVerify(token, remoteJwks, {
      issuer: "privy.io",
    }));
  } catch {
    return null;
  }

  const privyDid = payload.sub;
  if (!privyDid) return null;

  const wallet = await resolveWallet(privyDid);
  if (!wallet) return null;

  // Same bootstrap contract the old SIWE verify route provided.
  const dbUser = await prisma.user.upsert({
    where: { wallet },
    update: {},
    create: { wallet, username: null, avatar: null },
  });

  return { userId: dbUser.id, wallet: dbUser.wallet };
}
