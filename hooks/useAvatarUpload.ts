"use client";

import { useState, useRef, useCallback } from "react";
import { useAuthContext } from "@/context/AuthContext";

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface UseAvatarUploadReturn {
  inputRef: React.RefObject<HTMLInputElement>;
  preview: string | null;
  isUploading: boolean;
  error: string | null;
  triggerPicker: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  clearError: () => void;
}

export function useAvatarUpload(
  currentAvatar?: string | null,
  onSuccess?: (base64: string) => void,
): UseAvatarUploadReturn {
  const { updateProfile } = useAuthContext();
  const inputRef = useRef<HTMLInputElement>(null!);
  const [preview, setPreview] = useState<string | null>(currentAvatar ?? null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerPicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Reset input so same file can be re-selected
      e.target.value = "";

      // Validate type
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Only JPG, PNG, WebP or GIF images are allowed");
        return;
      }

      // Validate size
      if (file.size > MAX_SIZE_BYTES) {
        setError("Image must be under 2MB");
        return;
      }

      setError(null);
      setIsUploading(true);

      try {
        // Convert to base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsDataURL(file);
        });

        // Optimistic preview
        setPreview(base64);

        // Save to DB
        const result = await updateProfile({ avatar: base64 });

        if (result && "error" in result) {
          setError(result.error as string);
          // Revert preview on failure
          setPreview(currentAvatar ?? null);
        } else {
          onSuccess?.(base64);
        }
      } catch (err) {
        setError("Upload failed — please try again");
        setPreview(currentAvatar ?? null);
      } finally {
        setIsUploading(false);
      }
    },
    [updateProfile, currentAvatar, onSuccess],
  );

  return {
    inputRef,
    preview,
    isUploading,
    error,
    triggerPicker,
    handleFileChange,
    clearError,
  };
}
