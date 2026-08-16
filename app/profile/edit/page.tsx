"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Camera,
  Check,
  UserRound,
  ArrowLeft,
  User,
  FileText,
  Twitter,
  Send,
  Sparkles,
} from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { Navbar } from "@/components/layout/Navbar";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { GameHeader } from "@/components/core/games/GameHeader";

export default function EditProfilePage() {
  const {
    user,
    isAuthenticated,
    isLoading,
    updateProfile,
    signIn,
  } = useAuthContext();
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
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
  } = useAvatarUpload(user?.avatar);

  useEffect(() => {
    if (!user) return;
    setForm({
      username: user.username ?? "",
      bio: user.bio ?? "",
      twitter: user.twitter ?? "",
      telegram: user.telegram ?? "",
    });
  }, [user]);

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
      return;
    }

    router.push("/profile");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#050505] px-4">
        <div className="h-10 w-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 bg-[#050505] px-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/10 bg-white/5">
          <UserRound className="h-9 w-9 text-[#9A9A9A]" />
        </div>
        <div className="space-y-2">
          <p className="text-[22px] font-semibold text-[#F3F3F3]">
            Edit Profile
          </p>
          <p className="max-w-[280px] text-sm leading-relaxed text-[#9A9A9A]">
            Sign in with your wallet to update your profile.
          </p>
        </div>
        <button
          type="button"
          onClick={signIn}
          className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-[15px] font-semibold text-black transition-transform hover:-translate-y-0.5 hover:bg-[#F5F5F5]"
        >
          Connect wallet
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] px-4 pb-12 pt-24 md:pt-28">
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <Navbar />
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 animate-fade-up">
        <GameHeader gameName="Edit Profile" />

        <SurfaceCard as="section" className="overflow-hidden p-0 border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent shadow-2xl">
          {/* Hero Cover Banner */}
          <div className="relative h-32 w-full overflow-hidden sm:h-40">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-950/70 via-purple-900/40 to-neutral-950" />
            <div className="absolute -left-10 -top-16 h-56 w-56 rounded-full bg-violet-500/25 blur-[80px]" />
            <div className="absolute -right-16 -top-10 h-64 w-64 rounded-full bg-purple-500/20 blur-[90px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] bg-[length:18px_18px]" />

            <div className="absolute left-5 top-4 flex items-center justify-between right-5">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E8E8E8] backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                Profile Settings
              </div>
              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs font-semibold text-[#CBCBCB] backdrop-blur-md transition-colors hover:border-white/20 hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-[#F3F3F3] sm:text-3xl">
                Edit Your Profile
              </h1>
              <p className="text-sm leading-relaxed text-[#A3A3A3]">
                Customize your public avatar, handle, bio, and linked social profiles.
              </p>
            </div>

            {/* Avatar Section with Gradient Ring */}
            <div className="flex flex-col items-center sm:flex-row sm:items-center gap-6 rounded-2xl border border-white/10 bg-[#0A0A0E] p-5">
              <div className="relative shrink-0">
                <div className="h-28 w-28 p-1 rounded-[32px] bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 shadow-xl">
                  <div className="relative h-full w-full overflow-hidden rounded-[28px] bg-neutral-900">
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt="avatar preview"
                        width={112}
                        height={112}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600/30 to-purple-900/40 text-4xl font-bold text-white">
                        {(user.username ?? "A")[0].toUpperCase()}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={triggerPicker}
                      disabled={isUploading}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity hover:opacity-100"
                      aria-label="Upload avatar"
                    >
                      {isUploading ? (
                        <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      ) : (
                        <Camera className="h-6 w-6 text-white" />
                      )}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={triggerPicker}
                  disabled={isUploading}
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0A0A0E] bg-white text-black shadow-lg transition-transform hover:scale-105"
                  aria-label="Upload avatar button"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-2 text-center sm:text-left">
                <h3 className="text-base font-bold text-[#F3F3F3]">
                  Profile Avatar
                </h3>
                <p className="text-xs text-[#8A8A8A] max-w-sm">
                  Upload a custom picture or avatar. Supported formats: PNG, JPG, WEBP, or GIF up to 5MB.
                </p>
                <button
                  type="button"
                  onClick={triggerPicker}
                  disabled={isUploading}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed"
                >
                  <Camera className="h-3.5 w-3.5" />
                  {isUploading ? "Uploading file..." : "Choose picture"}
                </button>
              </div>
            </div>

            {/* Icon-Augmented Form Input Grid */}
            <div className="grid gap-5">
              {/* Username Input */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8A8A8A]">
                  Username
                </label>
                <div className="relative flex items-center rounded-xl border border-white/10 bg-[#0A0A0E] transition-colors focus-within:border-violet-500/80 focus-within:ring-1 focus-within:ring-violet-500/50">
                  <User className="absolute left-3.5 h-4 w-4 text-[#737373]" />
                  <input
                    value={form.username}
                    onChange={(e) => setForm((c) => ({ ...c, username: e.target.value }))}
                    placeholder="rafla_player"
                    autoComplete="username"
                    className="h-12 w-full bg-transparent pl-10 pr-4 text-sm font-medium text-[#F3F3F3] outline-none placeholder:text-[#555]"
                  />
                </div>
              </div>

              {/* Bio Input */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8A8A8A]">
                  Bio
                </label>
                <div className="relative flex rounded-xl border border-white/10 bg-[#0A0A0E] transition-colors focus-within:border-violet-500/80 focus-within:ring-1 focus-within:ring-violet-500/50">
                  <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-[#737373]" />
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm((c) => ({ ...c, bio: e.target.value }))}
                    placeholder="Tell people what you’re about..."
                    rows={3}
                    className="min-h-[100px] w-full bg-transparent pl-10 pr-4 py-3 text-sm font-medium text-[#F3F3F3] outline-none placeholder:text-[#555]"
                  />
                </div>
              </div>

              {/* Twitter & Telegram Grid */}
              <div className="grid gap-5 sm:grid-cols-2">
                {/* Twitter / X */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8A8A8A]">
                    Twitter / X
                  </label>
                  <div className="relative flex items-center rounded-xl border border-white/10 bg-[#0A0A0E] transition-colors focus-within:border-violet-500/80 focus-within:ring-1 focus-within:ring-violet-500/50">
                    <Twitter className="absolute left-3.5 h-4 w-4 text-[#737373]" />
                    <input
                      value={form.twitter}
                      onChange={(e) => setForm((c) => ({ ...c, twitter: e.target.value }))}
                      placeholder="@handle"
                      className="h-12 w-full bg-transparent pl-10 pr-4 text-sm font-medium text-[#F3F3F3] outline-none placeholder:text-[#555]"
                    />
                  </div>
                </div>

                {/* Telegram */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8A8A8A]">
                    Telegram
                  </label>
                  <div className="relative flex items-center rounded-xl border border-white/10 bg-[#0A0A0E] transition-colors focus-within:border-violet-500/80 focus-within:ring-1 focus-within:ring-violet-500/50">
                    <Send className="absolute left-3.5 h-4 w-4 text-[#737373]" />
                    <input
                      value={form.telegram}
                      onChange={(e) => setForm((c) => ({ ...c, telegram: e.target.value }))}
                      placeholder="@handle"
                      className="h-12 w-full bg-transparent pl-10 pr-4 text-sm font-medium text-[#F3F3F3] outline-none placeholder:text-[#555]"
                    />
                  </div>
                </div>
              </div>

              {/* Error alerts */}
              {uploadError ? (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{uploadError}</span>
                  <button
                    type="button"
                    onClick={clearError}
                    className="ml-auto text-xs text-red-200 hover:text-white"
                  >
                    Dismiss
                  </button>
                </div>
              ) : null}

              {saveError ? (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {saveError}
                </div>
              ) : null}

              {/* Action Button Row */}
              <div className="grid gap-3 pt-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => router.push("/profile")}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] text-sm font-semibold text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/[0.06]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className={`inline-flex h-12 items-center justify-center gap-2 rounded-2xl text-sm font-bold transition-transform hover:scale-[1.01] active:scale-[0.99] ${
                    saving
                      ? "cursor-not-allowed bg-white/10 text-[#555]"
                      : "bg-white text-black hover:bg-[#F5F5F5]"
                  }`}
                >
                  <Check className="h-4 w-4" />
                  {saving ? "Saving changes..." : "Save changes"}
                </button>
              </div>
            </div>
          </div>
        </SurfaceCard>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />
      </main>
    </div>
  );
}
