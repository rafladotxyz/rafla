"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Twitter,
  Send,
  Copy,
  Check,
  LogOut,
  Edit3,
  History,
  Trophy,
  Gamepad2,
  DollarSign,
  X,
  Camera,
  AlertCircle,
} from "lucide-react";

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
    signOut,
  } = useAuthContext();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [history, setHistory] = useState<GameHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    username: "",
    bio: "",
    twitter: "",
    telegram: "",
  });

  const {
    inputRef,
    preview: avatarPreview,
    isUploading,
    error: uploadError,
    triggerPicker,
    handleFileChange,
    clearError,
  } = useAvatarUpload(user?.avatar, () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  });

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username ?? "",
        bio: user.bio ?? "",
        twitter: user.twitter ?? "",
        telegram: user.telegram ?? "",
      });
      fetchHistory();
    }
  }, [user?.id]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/user/history", { headers: authHeaders() });
      if (res.ok) {
        const { history } = await res.json();
        setHistory(history);
      }
    } catch {
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    const result = await updateProfile({
      username: form.username || undefined,
      bio: form.bio || undefined,
      twitter: form.twitter || undefined,
      telegram: form.telegram || undefined,
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

  const copyWallet = () => {
    if (!user?.wallet) return;
    navigator.clipboard.writeText(user.wallet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wins = history.filter((h) => h.isWin).length;
  const totalWon = history
    .filter((h) => h.isWin)
    .reduce((acc, h) => acc + Number(h.prizeAmount) / 1_000_000, 0);
  const winRate =
    history.length > 0 ? ((wins / history.length) * 100).toFixed(0) : "0";

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-10 h-10 rounded-full border-2 border-[#CBCBCB] border-t-transparent animate-spin" />
      </div>
    );

  if (!isAuthenticated || !user)
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4 text-center">
        <div className="w-20 h-20 rounded-3xl bg-[#141414] border border-[#282828] flex items-center justify-center">
          <UserIcon className="w-9 h-9 text-[#444]" />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-[22px] font-semibold text-[#D9D9D9]">
            Your Profile
          </p>
          <p className="text-[14px] text-[#737373] max-w-[260px]">
            Sign in with your wallet to view your stats and game history.
          </p>
        </div>
        <button
          onClick={signIn}
          className="h-12 px-8 rounded-2xl bg-white text-[#0A0A0A] text-[15px] font-semibold hover:bg-[#E8E8E8] transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    );

  const shortWallet = `${user.wallet.slice(0, 6)}...${user.wallet.slice(-4)}`;
  const displayName = user.username ?? "Anonymous";

  return (
    <div className="w-full max-w-[760px] mx-auto px-4 py-10 flex flex-col gap-8">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
        {/* Avatar */}
        <div className="relative shrink-0 group">
          <div className="w-24 h-24 rounded-3xl bg-[#141414] border border-[#282828] overflow-hidden">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-[32px] font-bold text-[#444]">
                  {displayName[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={triggerPicker}
            disabled={isUploading}
            className="absolute inset-0 rounded-3xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            {isUploading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <Camera className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col items-center sm:items-start gap-2">
          <p className="text-[24px] font-bold text-[#D9D9D9]">{displayName}</p>
          {user.bio && (
            <p className="text-[13px] text-[#737373] max-w-sm">{user.bio}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <button
              onClick={copyWallet}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141414] border border-[#282828] text-[12px] text-[#737373] hover:text-[#CBCBCB] hover:border-[#444] transition-colors font-mono"
            >
              {shortWallet}
              {copied ? (
                <Check className="w-3 h-3 text-green-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
            {user.twitter && (
              <a
                href={`https://twitter.com/${user.twitter.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-full bg-[#141414] border border-[#282828] text-[#737373] hover:text-[#CBCBCB] transition-colors"
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
            )}
            {user.telegram && (
              <a
                href={`https://t.me/${user.telegram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-full bg-[#141414] border border-[#282828] text-[#737373] hover:text-[#CBCBCB] transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setEditing(true)}
            className="h-10 px-4 rounded-xl border border-[#282828] text-[13px] text-[#CBCBCB] hover:border-[#444] transition-colors flex items-center gap-2"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            onClick={signOut}
            className="h-10 px-4 rounded-xl border border-red-900/40 text-[13px] text-red-500 hover:border-red-700/60 hover:bg-red-500/5 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </div>

      {/* Upload error */}
      {uploadError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[13px] text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {uploadError}
          <button onClick={clearError} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Games", value: history.length, icon: Gamepad2 },
          { label: "Wins", value: wins, icon: Trophy },
          { label: "Win Rate", value: `${winRate}%`, icon: History },
          {
            label: "Total Won",
            value: `$${totalWon.toFixed(2)}`,
            icon: DollarSign,
          },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex flex-col gap-3 p-4 rounded-2xl bg-[#0D0D0D] border border-[#1A1A1A] hover:border-[#282828] transition-colors"
          >
            <Icon className="w-4 h-4 text-[#444]" />
            <div>
              <p className="text-[22px] font-bold text-[#D9D9D9] leading-none">
                {value}
              </p>
              <p className="text-[11px] text-[#737373] mt-1 uppercase tracking-wider">
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Game History ── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-semibold text-[#D9D9D9]">
            Game History
          </p>
          {history.length > 0 && (
            <p className="text-[12px] text-[#737373]">
              Last {Math.min(history.length, 10)} games
            </p>
          )}
        </div>

        {historyLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 rounded-2xl bg-[#0D0D0D] border border-[#1A1A1A] animate-pulse"
              />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 rounded-2xl bg-[#0D0D0D] border border-[#1A1A1A]">
            <Gamepad2 className="w-8 h-8 text-[#2A2A2A]" />
            <div className="text-center">
              <p className="text-[15px] font-medium text-[#D9D9D9]">
                No games yet
              </p>
              <p className="text-[13px] text-[#737373] mt-1">
                Join a room to start playing
              </p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="h-9 px-5 rounded-xl border border-[#282828] text-[13px] text-[#CBCBCB] hover:border-[#444] transition-colors"
            >
              Browse Games
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {history.slice(0, 10).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-4 py-3.5 rounded-2xl bg-[#0D0D0D] border border-[#1A1A1A] hover:border-[#282828] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.isWin ? "bg-green-500/10 text-green-400" : "bg-[#141414] text-[#444]"}`}
                  >
                    {item.isWin ? (
                      <Trophy className="w-4 h-4" />
                    ) : (
                      <Gamepad2 className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-[#D9D9D9] capitalize">
                      Rafla {item.gameType}
                    </p>
                    <p className="text-[11px] text-[#737373] font-mono">
                      {new Date(item.settledAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      · {item.roomId.slice(0, 8)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p
                    className={`text-[15px] font-bold ${item.isWin ? "text-green-400" : "text-[#444]"}`}
                  >
                    {item.isWin
                      ? `+$${(Number(item.prizeAmount) / 1_000_000).toFixed(2)}`
                      : "—"}
                  </p>
                  <span
                    className={`text-[10px] uppercase tracking-widest font-bold ${item.isWin ? "text-green-500/60" : "text-[#3A3A3A]"}`}
                  >
                    {item.isWin ? "Won" : "Played"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Edit modal ── */}
      {editing && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-[440px] bg-[#0D0D0D] border border-[#1E1E1E] rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#1A1A1A]">
              <p className="text-[16px] font-semibold text-[#D9D9D9]">
                Edit Profile
              </p>
              <button
                onClick={() => setEditing(false)}
                className="w-8 h-8 rounded-xl bg-[#141414] border border-[#282828] flex items-center justify-center text-[#737373] hover:text-[#CBCBCB] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              {[
                {
                  key: "username",
                  label: "Username",
                  placeholder: "rafla_player",
                },
                {
                  key: "bio",
                  label: "Bio",
                  placeholder: "Tell us about yourself",
                },
                {
                  key: "twitter",
                  label: "Twitter / X",
                  placeholder: "@handle",
                },
                { key: "telegram", label: "Telegram", placeholder: "@handle" },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-[#737373] uppercase tracking-wider ml-1">
                    {label}
                  </label>
                  <input
                    value={form[key as keyof typeof form]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                    placeholder={placeholder}
                    className="h-11 px-4 rounded-xl bg-[#0A0A0A] border border-[#282828] text-[14px] text-[#CBCBCB] placeholder-[#3A3A3A] outline-none focus:border-[#555] transition-colors"
                  />
                </div>
              ))}
              {saveError && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-[12px] text-red-400">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {saveError}
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 h-11 rounded-xl border border-[#282828] text-[14px] text-[#737373] hover:text-[#CBCBCB] hover:border-[#444] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`flex-[2] h-11 rounded-xl text-[14px] font-semibold transition-colors ${saving ? "bg-[#1A1A1A] text-[#4A4A4A] cursor-not-allowed" : "bg-white text-[#0A0A0A] hover:bg-[#E8E8E8] cursor-pointer"}`}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {saveSuccess && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#141414] border border-green-500/30 text-[14px] text-green-400 shadow-2xl">
          <Check className="w-4 h-4" />
          Profile updated
        </div>
      )}
    </div>
  );
}
