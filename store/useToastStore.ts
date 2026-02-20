"use client";
import { create } from "zustand";
import { CheckCircleIcon, XCircleIcon, XIcon } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type ToastType = "success" | "error";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  dismiss: (id: string) => void;
}

// ─── Store ───────────────────────────────────────────────────────────────────

const TOAST_DURATION = 3500;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  showToast: (message, type = "success") => {
    const id = `${Date.now()}-${Math.random()}`;

    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, TOAST_DURATION);
  },

  success: (message) => useToastStore.getState().showToast(message, "success"),
  error: (message) => useToastStore.getState().showToast(message, "error"),

  dismiss: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
