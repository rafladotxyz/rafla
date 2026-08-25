"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";

export interface RaflaUser {
  id: string;
  wallet: string;
  username: string | null;
  avatar: string | null;
  bio: string | null;
  twitter: string | null;
  telegram: string | null;
}

interface AuthState {
  user: RaflaUser | null;
  token: string | null;
  isAuthenticated: boolean;
  error: string | null;
}

const TOKEN_REFRESH_MS = 15 * 60_000;

export function useAuth() {
  const { address } = useAccount();
  const {
    ready,
    authenticated,
    user: privyUser,
    login,
    logout,
    getAccessToken,
  } = usePrivy();

  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    error: null,
  });
  const [profileSettled, setProfileSettled] = useState(false);

  // Synchronous token source for authHeaders(); refreshed below.
  const tokenRef = useRef<string | null>(null);

  const clearAuth = useCallback(() => {
    tokenRef.current = null;
    setProfileSettled(false);
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  }, []);

  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const token = await getAccessToken();
      tokenRef.current = token;
      return token;
    } catch {
      // Token is no longer obtainable — the session is dead.
      clearAuth();
      return null;
    }
  }, [getAccessToken, clearAuth]);

  const fetchProfile = useCallback(async (token: string) => {
    try {
      const res = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;

      const { user } = await res.json();
      setState({
        user,
        token,
        isAuthenticated: true,
        error: null,
      });
    } catch {
      // Network hiccup — keep any existing state; next refresh retries.
    } finally {
      setProfileSettled(true);
    }
  }, []);

  // Prefer the active wagmi wallet; fall back to a Privy linked wallet
  // (covers embedded-wallet users who logged in via email/social).
  const linkedWallet = privyUser?.linkedAccounts?.find(
    (account): account is Extract<typeof account, { address: string }> =>
      account.type === "wallet" &&
      typeof (account as { address?: unknown }).address === "string",
  );
  const walletAddress =
    address ?? linkedWallet?.address ?? state.user?.wallet ?? null;

  // Bootstrap + periodic refresh while signed in. All state changes happen in
  // async continuations, never synchronously inside the effect body.
  useEffect(() => {
    if (!ready || !authenticated) return;

    let cancelled = false;
    void (async () => {
      const token = await refreshToken();
      if (cancelled || !token) return;
      await fetchProfile(token);
    })();

    const interval = window.setInterval(() => {
      void refreshToken();
    }, TOKEN_REFRESH_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [ready, authenticated, refreshToken, fetchProfile]);

  // signIn opens the Privy modal; the bootstrap effect completes auth.
  const signIn = useCallback(async () => {
    if (!ready || authenticated) return;
    setState((s) => ({ ...s, error: null }));
    try {
      await login();
    } catch {
      // User closed the modal — not an error.
    }
  }, [ready, authenticated, login]);

  const signOut = useCallback(async () => {
    try {
      if (logout) await logout();
    } catch {
      // best effort
    }
    clearAuth();
  }, [logout, clearAuth]);

  const updateProfile = useCallback(
    async (
      data: Partial<
        Pick<RaflaUser, "username" | "avatar" | "bio" | "twitter" | "telegram">
      >,
    ) => {
      const token = tokenRef.current ?? (await refreshToken());
      if (!token) return { error: "not authenticated" };

      try {
        const payload = { ...data };
        if (payload.username) {
          payload.username = payload.username.trim().toLowerCase();
          if (payload.username.startsWith("@")) {
            payload.username = payload.username.slice(1);
          }
        }

        const res = await fetch("/api/user/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const json = await res.json();
        if (!res.ok) return { error: json.error };

        setState((s) => ({ ...s, user: json.user }));
        return { ok: true };
      } catch {
        return { error: "update failed" };
      }
    },
    [refreshToken],
  );

  // Sync helper for any API call.
  const authHeaders = useCallback((): Record<string, string> => {
    const token = tokenRef.current ?? state.token;
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }, [state.token]);

  return {
    user: state.user,
    token: state.token,
    isAuthenticated: authenticated && state.isAuthenticated,
    // Resolving until Privy hydrates; once signed in, until the profile lands.
    isLoading: !ready || (authenticated && !profileSettled),
    error: state.error,
    signIn,
    signOut,
    updateProfile,
    authHeaders,
    address: walletAddress,
    isConnected: !!walletAddress,
  };
}
