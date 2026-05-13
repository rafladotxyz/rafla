"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useSignMessage, useDisconnect } from "wagmi";
import { SiweMessage } from "siwe";

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
  isLoading: boolean;
  error: string | null;
}

const TOKEN_KEY = "rafla_jwt";

export function useAuth() {
  const { address, chainId, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();

  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // On mount — restore token + fetch profile if token exists
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      fetchProfile(stored);
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  // When wallet disconnects — clear auth
  useEffect(() => {
    if (!isConnected && state.isAuthenticated) {
      clearAuth();
    }
  }, [isConnected]);

  const fetchProfile = useCallback(async (token: string) => {
    try {
      const res = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        // Token expired or invalid
        clearAuth();
        return;
      }

      const { user } = await res.json();
      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch {
      clearAuth();
    }
  }, []);

  const signIn = useCallback(async () => {
    if (!address || !chainId) {
      setState((s) => ({ ...s, error: "wallet not connected" }));
      return;
    }

    setState((s) => ({ ...s, isLoading: true, error: null }));

    try {
      // 1. Get nonce from server
      const nonceRes = await fetch(
        `/api/auth/nonce?wallet=${address.toLowerCase()}`,
      );
      if (!nonceRes.ok) throw new Error("failed to get nonce");
      const { nonce } = await nonceRes.json();

      // 2. Build SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement:
          "Sign in to Rafla. This request will not trigger a blockchain transaction or cost any gas fees.",
        uri: window.location.origin,
        version: "1",
        chainId,
        nonce,
      });

      const preparedMessage = message.prepareMessage();

      // 3. Ask wallet to sign
      const signature = await signMessageAsync({ message: preparedMessage });

      // 4. Verify on server → get JWT + user
      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: preparedMessage, signature }),
      });

      if (!verifyRes.ok) {
        const { error } = await verifyRes.json();
        throw new Error(error || "verification failed");
      }

      const { token, user } = await verifyRes.json();

      // 5. Store JWT in localStorage for persistence
      localStorage.setItem(TOKEN_KEY, token);

      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "sign in failed";
      // User rejected the signature — don't show error
      const isUserRejection =
        message.includes("rejected") || message.includes("denied");
      setState((s) => ({
        ...s,
        isLoading: false,
        error: isUserRejection ? null : message,
      }));
    }
  }, [address, chainId, signMessageAsync]);

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // best effort
    }
    clearAuth();
    disconnect();
  }, [disconnect]);

  const updateProfile = useCallback(
    async (
      data: Partial<
        Pick<RaflaUser, "username" | "avatar" | "bio" | "twitter" | "telegram">
      >,
    ) => {
      if (!state.token) return { error: "not authenticated" };

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
            Authorization: `Bearer ${state.token}`,
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
    [state.token],
  );

  // Helper — get auth headers for any API call
  const authHeaders = useCallback((): Record<string, string> => {
    if (!state.token) return {};
    return { Authorization: `Bearer ${state.token}` };
  }, [state.token]);

  function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }

  return {
    ...state,
    signIn,
    signOut,
    updateProfile,
    authHeaders,
    address,
    isConnected,
  };
}
