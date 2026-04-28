"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  User as UserIcon, 
  Camera, 
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
  Plus,
  X
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setSaveError("File size too large (max 2MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setForm((f) => ({ ...f, avatar: base64 }));
        
        // Auto-save avatar
        setSaving(true);
        const result = await updateProfile({ avatar: base64 });
        setSaving(false);
        if (result && "error" in result) {
          setSaveError(result.error as string);
        } else {
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const copyWallet = () => {
    if (user?.wallet) {
      navigator.clipboard.writeText(user.wallet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-white/10" />
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  // ── Not signed in ────────────────────────────────────────────────────────

  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4 text-center">
        <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-2">
          <UserIcon className="w-10 h-10 text-white/20" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Your Profile</h1>
          <p className="text-white/50 max-w-[300px]">
            Sign in with your wallet to view your stats, history, and customize your profile.
          </p>
        </div>
        <button
          onClick={signIn}
          className="h-12 px-8 rounded-2xl bg-white text-black font-semibold hover:bg-zinc-200 transition-all active:scale-95 shadow-xl shadow-white/5"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  const shortWallet = `${user.wallet.slice(0, 6)}...${user.wallet.slice(-4)}`;

  return (
    <div className="w-full max-w-[800px] mx-auto px-4 py-12 flex flex-col gap-10">
      
      {/* ── Profile Header ─────────────────────────────────────────────── */}
      <div className="relative group">
        {/* Background Glow */}
        <div className="absolute -inset-10 bg-indigo-500/10 blur-[100px] rounded-full opacity-50 pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
          {/* Avatar with Upload */}
          <div className="relative">
            <div className="w-32 h-32 rounded-[2.5rem] bg-zinc-900 border-2 border-white/10 overflow-hidden flex items-center justify-center group/avatar shadow-2xl">
              {form.avatar || user.avatar ? (
                <img
                  src={form.avatar || (user.avatar as string)}
                  alt="avatar"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white/30">
                    {(user.username ?? user.wallet)[0].toUpperCase()}
                  </span>
                </div>
              )}
              
              {/* Plus Overlay */}
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={saving}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] disabled:opacity-100"
              >
                <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg transform scale-90 group-hover/avatar:scale-100 transition-transform">
                  {saving ? (
                    <div className="w-5 h-5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  ) : (
                    <Plus className="w-6 h-6" />
                  )}
                </div>
              </button>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex-1 flex flex-col items-center md:items-start gap-3">
            <div className="flex flex-col items-center md:items-start">
              <h1 className="text-3xl font-bold text-white tracking-tight">
                {user.username ?? "Anonymous Player"}
              </h1>
              <p className="text-white/50 text-[15px] max-w-[400px] text-center md:text-left mt-1">
                {user.bio || "No bio yet. Add one to let others know who you are."}
              </p>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <button 
                onClick={copyWallet}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[13px] text-white/70 hover:bg-white/10 transition-colors"
              >
                <code className="font-mono">{shortWallet}</code>
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              
              <div className="flex gap-2">
                {user.twitter && (
                  <a href={`https://twitter.com/${user.twitter.replace("@", "")}`} target="_blank" className="p-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-indigo-500/20 transition-all">
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {user.telegram && (
                  <a href={`https://t.me/${user.telegram.replace("@", "")}`} target="_blank" className="p-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-indigo-500/20 transition-all">
                    <Send className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto">
            <button
              onClick={() => setEditing((e) => !e)}
              className="flex-1 md:w-40 h-11 rounded-2xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
            <button
              onClick={signOut}
              className="md:w-40 h-11 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-medium hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* ── Edit Modal Overlay ─────────────────────────────────────────── */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-[500px] bg-zinc-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Edit Profile</h2>
              <button onClick={() => setEditing(false)} className="p-2 rounded-xl hover:bg-white/5 text-white/50 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 flex flex-col gap-5">
              <div className="flex flex-col gap-4">
                {[
                  { key: "username", label: "Username", placeholder: "rafla_player", icon: UserIcon },
                  { key: "bio", label: "Bio", placeholder: "Tell us about yourself", icon: Edit3 },
                  { key: "twitter", label: "Twitter / X", placeholder: "@handle", icon: Twitter },
                  { key: "telegram", label: "Telegram", placeholder: "@handle", icon: Send },
                ].map(({ key, label, placeholder, icon: Icon }) => (
                  <div key={key} className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-medium text-white/50 ml-1">
                      {label}
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20">
                        <Icon className="w-4 h-4" />
                      </div>
                      <input
                        value={form[key as keyof typeof form]}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, [key]: e.target.value }))
                        }
                        placeholder={placeholder}
                        className="w-full h-12 pl-10 pr-4 rounded-xl bg-black border border-white/10 text-[14px] text-white placeholder-white/20 outline-none focus:border-indigo-500/50 transition-all"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {saveError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[13px] text-red-400">
                  {saveError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 h-12 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-[2] h-12 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Stats Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Games", value: history.length, icon: Gamepad2, color: "text-indigo-400" },
          {
            label: "Wins",
            value: history.filter((h) => h.isWin).length,
            icon: Trophy,
            color: "text-yellow-400"
          },
          {
            label: "Win Rate",
            value: history.length > 0 ? `${((history.filter((h) => h.isWin).length / history.length) * 100).toFixed(0)}%` : "0%",
            icon: History,
            color: "text-emerald-400"
          },
          {
            label: "Total Won",
            value: `$${history
              .filter((h) => h.isWin)
              .reduce((acc, h) => acc + Number(h.prizeAmount) / 1_000_000, 0)
              .toFixed(2)}`,
            icon: DollarSign,
            color: "text-white"
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="group relative p-5 rounded-3xl bg-zinc-900 border border-white/10 hover:border-white/20 transition-all hover:translate-y-[-2px] overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Icon className={`w-12 h-12 ${color}`} />
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-[13px] text-white/50 font-medium mt-1 uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Game History Section ────────────────────────────────────────── */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Recent Games</h2>
          </div>
          {history.length > 0 && (
            <span className="text-[13px] text-white/30 font-mono">
              Last {Math.min(history.length, 10)} games
            </span>
          )}
        </div>

        {historyLoading ? (
          <div className="flex flex-col gap-3 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 rounded-3xl bg-zinc-900/50 border border-white/5" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-[2.5rem] bg-zinc-900 border border-white/10 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/20">
              <Gamepad2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="text-white font-medium text-lg">No games played yet</p>
              <p className="text-white/40 max-w-[240px]">Join a room to start your Rafla journey!</p>
            </div>
            <button 
              onClick={() => router.push("/")}
              className="mt-2 px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors"
            >
              Browse Games
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {history.slice(0, 10).map((item) => (
              <div
                key={item.id}
                className="group flex items-center justify-between p-5 rounded-3xl bg-zinc-900 border border-white/10 hover:border-indigo-500/30 transition-all hover:bg-indigo-500/[0.02]"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      item.isWin 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : "bg-white/5 text-white/40 border border-white/10"
                    }`}
                  >
                    {item.isWin ? <Trophy className="w-6 h-6" /> : <Gamepad2 className="w-6 h-6" />}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[15px] font-bold text-white capitalize group-hover:text-indigo-100 transition-colors">
                      Rafla {item.gameType}
                    </p>
                    <p className="text-[12px] text-white/40 flex items-center gap-2">
                      {new Date(item.settledAt).toLocaleDateString(undefined, { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                      <span className="w-1 h-1 rounded-full bg-white/10" />
                      ID: {item.roomId.slice(0, 8)}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  <p
                    className={`text-[17px] font-black ${
                      item.isWin ? "text-emerald-400" : "text-white/20"
                    }`}
                  >
                    {item.isWin
                      ? `+$${(Number(item.prizeAmount) / 1_000_000).toFixed(2)}`
                      : "—"}
                  </p>
                  <div className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full ${
                    item.isWin ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/30"
                  }`}>
                    {item.isWin ? "Winner" : "Played"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {saveSuccess && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl bg-emerald-500 text-white font-bold shadow-2xl shadow-emerald-500/20 animate-in slide-in-from-bottom-10 duration-300 flex items-center gap-2">
          <Check className="w-5 h-5" />
          Profile updated successfully!
        </div>
      )}
    </div>
  );
}

