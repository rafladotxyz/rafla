"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AlertCircle, Camera, Check, UserRound } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { Navbar } from "@/components/layout/Navbar";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { GameHeader } from "@/components/core/games/GameHeader";

const PROFILE_FIELDS = [
  {
    key: "username" as const,
    label: "Username",
    placeholder: "rafla_player",
    autoComplete: "username",
  },
  {
    key: "bio" as const,
    label: "Bio",
    placeholder: "Tell people what you’re about.",
    autoComplete: "off",
  },
  {
    key: "twitter" as const,
    label: "Twitter / X",
    placeholder: "@handle",
    autoComplete: "off",
  },
  {
    key: "telegram" as const,
    label: "Telegram",
    placeholder: "@handle",
    autoComplete: "off",
  },
];

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
  } = useAvatarUpload(user?.avatar, () => {
    // avatar updated
  });

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
        <div className="h-10 w-10 rounded-full border-2 border-[#CBCBCB] border-t-transparent animate-spin" />
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

        <SurfaceCard as="section" className="p-6 md:p-8">
          <div className="mb-6 space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A8A8A]">
              Account Settings
            </p>
            <h1 className="text-2xl font-bold text-[#F3F3F3] sm:text-3xl">
              Edit Your Profile
            </h1>
            <p className="text-sm leading-relaxed text-[#A3A3A3]">
              Update your public display avatar, username, bio, and social handles.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-[220px_1fr]">
            {/* Avatar Section */}
            <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A8A8A]">
                Avatar
              </p>
              <div className="mt-4 flex flex-col items-center gap-4">
                <div className="relative h-28 w-28 overflow-hidden rounded-[28px] border-2 border-white/10 bg-black/40 shadow-xl">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="avatar preview"
                      width={112}
                      height={112}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600/30 to-purple-900/40 text-4xl font-semibold text-[#F3F3F3]">
                      {(user.username ?? "A")[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={triggerPicker}
                  disabled={isUploading}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-xs font-semibold text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:text-[#4A4A4A]"
                >
                  <Camera className="h-4 w-4" />
                  {isUploading ? "Uploading..." : "Change avatar"}
                </button>
              </div>
            </div>

            {/* Input Fields */}
            <div className="grid gap-4">
              {PROFILE_FIELDS.map(({ key, label, placeholder, autoComplete }) => {
                const isBio = key === "bio";
                return (
                  <div key={key} className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A8A8A]">
                      {label}
                    </label>
                    {isBio ? (
                      <textarea
                        value={form[key]}
                        onChange={(e) =>
                          setForm((current) => ({
                            ...current,
                            [key]: e.target.value,
                          }))
                        }
                        placeholder={placeholder}
                        autoComplete={autoComplete}
                        rows={4}
                        className="min-h-[120px] w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[#F3F3F3] outline-none placeholder:text-[#666] focus:border-white/25 focus-visible:ring-2 focus-visible:ring-white/20"
                      />
                    ) : (
                      <input
                        value={form[key]}
                        onChange={(e) =>
                          setForm((current) => ({
                            ...current,
                            [key]: e.target.value,
                          }))
                        }
                        placeholder={placeholder}
                        autoComplete={autoComplete}
                        className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-[#F3F3F3] outline-none placeholder:text-[#666] focus:border-white/25 focus-visible:ring-2 focus-visible:ring-white/20"
                      />
                    )}
                  </div>
                );
              })}

              {uploadError ? (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{uploadError}</span>
                  <button
                    type="button"
                    onClick={clearError}
                    className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full text-red-200"
                  >
                    ×
                  </button>
                </div>
              ) : null}

              {saveError ? (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {saveError}
                </div>
              ) : null}

              <div className="grid gap-3 pt-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => router.push("/profile")}
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-sm font-semibold text-[#E8E8E8] transition-colors hover:border-white/20 hover:bg-white/[0.06]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className={`inline-flex h-12 items-center justify-center rounded-2xl text-sm font-semibold transition-transform active:scale-98 ${
                    saving
                      ? "cursor-not-allowed bg-white/5 text-[#4A4A4A]"
                      : "bg-white text-black hover:bg-[#F5F5F5]"
                  }`}
                >
                  {saving ? "Saving..." : "Save changes"}
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
