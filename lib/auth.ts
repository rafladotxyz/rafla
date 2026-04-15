import { NextRequest } from "next/server";
import { verifyJWT, extractBearer, JWTPayload } from "./jwt";

export async function requireAuth(
  req: NextRequest,
): Promise<JWTPayload | null> {
  const token = extractBearer(req.headers.get("authorization"));
  if (!token) return null;
  return verifyJWT(token);
}
