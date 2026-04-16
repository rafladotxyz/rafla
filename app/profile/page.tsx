"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface GameHistoryItem {
  id: string;
  roomId: string;
  gameType: string;
  prizeAmount: string;
  settledAt: string;
  isWin: boolean;
}

export default function ProfilePage() {
  const {
    user,
    isAuthenticated,
    isLoading,
    updateProfile,
    authHeaders,
    signIn,
  } = useAuthContext();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [history, setHistory] = useState<GameHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [form, setForm] = useState({
    username: "",
    bio: "",
    twitter: "",
    telegram: "",
    avatar: "",
  });

  // Populate form when user loads
  useEffect(() => {
    if (user) {
      setForm({
        username: user.username ?? "",
        bio: user.bio ?? "",
        twitter: user.twitter ?? "",
        telegram: user.telegram ?? "",
        avatar: user.avatar ?? "",
      });
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/user/history", {
        headers: authHeaders(),
      });
      if (res.ok) {
        const { history } = await res.json();
        setHistory(history);
      }
    } catch {
      // silent
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const result = await updateProfile({
      username: form.username || undefined,
      bio: form.bio || undefined,
      twitter: form.twitter || undefined,
      telegram: form.telegram || undefined,
      avatar: form.avatar || undefined,
    });

    setSaving(false);

    if (result && "error" in result) {
      setSaveError(result.error as string);
    } else {
      setSaveSuccess(true);
      setEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 rounded-full border-2 border-[#CBCBCB] border-t-transparent animate-spin" />
      </div>
    );
  }

  // ── Not signed in ────────────────────────────────────────────────────────

  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-[16px] text-[#737373]">
          Sign in to view your profile
        </p>
        <button
          onClick={signIn}
          className="h-11 px-6 rounded-xl bg-white text-[#0A0A0A] text-[14px] font-medium hover:bg-[#E8E8E8] transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  const shortWallet = `${user.wallet.slice(0, 6)}...${user.wallet.slice(-4)}`;

  return (
    <div className="w-full max-w-[680px] mx-auto px-4 py-8 flex flex-col gap-6">
      {/* ── Avatar + wallet ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#1f1f1f] border border-[#282828] flex items-center justify-center overflow-hidden shrink-0">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[24px] text-[#CBCBCB]">
              {(user.username ?? user.wallet)[0].toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-[18px] font-semibold text-[#D9D9D9]">
            {user.username ?? "Anonymous"}
          </p>
          <p className="text-[13px] text-[#737373] font-mono">{shortWallet}</p>
        </div>
        <button
          onClick={() => setEditing((e) => !e)}
          className="ml-auto h-9 px-4 rounded-xl border border-[#282828] text-[13px] text-[#CBCBCB] hover:border-[#444] transition-colors"
        >
          {editing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {/* ── Edit form ───────────────────────────────────────────────────── */}
      {editing && (
        <div className="flex flex-col gap-4 p-5 rounded-2xl bg-[#141414] border border-[#282828]">
          <p className="text-[15px] font-medium text-[#D9D9D9]">Edit Profile</p>

          {[
            { key: "username", label: "Username", placeholder: "rafla_player" },
            { key: "avatar", label: "Avatar URL", placeholder: "https://..." },
            { key: "bio", label: "Bio", placeholder: "Tell us about yourself" },
            { key: "twitter", label: "Twitter / X", placeholder: "@handle" },
            { key: "telegram", label: "Telegram", placeholder: "@handle" },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-[12px] text-[#737373] uppercase tracking-wider">
                {label}
              </label>
              <input
                value={form[key as keyof typeof form]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [key]: e.target.value }))
                }
                placeholder={placeholder}
                className="h-10 px-3 rounded-xl bg-[#0A0A0A] border border-[#282828] text-[14px] text-[#CBCBCB] placeholder-[#444] outline-none focus:border-[#555] transition-colors"
              />
            </div>
          ))}

          {saveError && <p className="text-[12px] text-red-400">{saveError}</p>}
          {saveSuccess && (
            <p className="text-[12px] text-green-400">Profile saved!</p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className={`h-11 rounded-xl text-[14px] font-medium transition-colors ${
              saving
                ? "bg-[#1A1A1A] text-[#4a4a4a] cursor-not-allowed"
                : "bg-white text-[#0A0A0A] hover:bg-[#E8E8E8] cursor-pointer"
            }`}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      {/* ── Stats row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Games", value: history.length },
          {
            label: "Wins",
            value: history.filter((h) => h.isWin).length,
          },
          {
            label: "Total Won",
            value: `$${history
              .filter((h) => h.isWin)
              .reduce((acc, h) => acc + Number(h.prizeAmount) / 1_000_000, 0)
              .toFixed(2)}`,
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex flex-col gap-1 p-4 rounded-2xl bg-[#141414] border border-[#282828]"
          >
            <p className="text-[22px] font-semibold text-[#D9D9D9]">{value}</p>
            <p className="text-[12px] text-[#737373]">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Social links ────────────────────────────────────────────────── */}
      {(user.twitter || user.telegram) && (
        <div className="flex gap-3">
          {user.twitter && (
            <a
              href={`https://twitter.com/${user.twitter.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 h-9 px-4 rounded-xl bg-[#141414] border border-[#282828] text-[13px] text-[#CBCBCB] hover:border-[#444] transition-colors"
            >
              𝕏 {user.twitter}
            </a>
          )}
          {user.telegram && (
            <a
              href={`https://t.me/${user.telegram.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 h-9 px-4 rounded-xl bg-[#141414] border border-[#282828] text-[13px] text-[#CBCBCB] hover:border-[#444] transition-colors"
            >
              ✈ {user.telegram}
            </a>
          )}
        </div>
      )}

      {/* ── Game history ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <p className="text-[15px] font-medium text-[#D9D9D9]">Game History</p>

        {historyLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 rounded-full border-2 border-[#CBCBCB] border-t-transparent animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="flex items-center justify-center py-8 rounded-2xl bg-[#141414] border border-[#282828]">
            <p className="text-[14px] text-[#737373]">No games played yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[#141414] border border-[#282828]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.isWin ? "bg-green-400" : "bg-red-400"
                    }`}
                  />
                  <div className="flex flex-col">
                    <p className="text-[14px] text-[#CBCBCB] capitalize">
                      Rafla {item.gameType}
                    </p>
                    <p className="text-[12px] text-[#737373]">
                      {new Date(item.settledAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p
                    className={`text-[14px] font-medium ${
                      item.isWin ? "text-green-400" : "text-[#737373]"
                    }`}
                  >
                    {item.isWin
                      ? `+$${(Number(item.prizeAmount) / 1_000_000).toFixed(2)}`
                      : "—"}
                  </p>
                  <p className="text-[11px] text-[#737373] capitalize">
                    {item.isWin ? "Won" : "Played"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
