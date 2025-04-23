"use client";
import { useEffect } from "react";

export default function Toast({
  open,
  message,
  type = "success",
  onClose,
  duration = 2500,
}: {
  open: boolean;
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}) {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  if (!open) return null;
  return (
    <div
      className={`fixed bottom-5 left-1/2 z-50 -translate-x-1/2 px-6 py-3 rounded shadow-xl text-white font-semibold animate-fade-in-fast transition-all
        ${type === "success" ? "bg-emerald-600" : type === "error" ? "bg-red-600" : "bg-blue-600"}`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
