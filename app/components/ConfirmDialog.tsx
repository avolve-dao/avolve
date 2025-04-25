'use client';
import React from 'react';

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}: {
  open: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-sm animate-fade-in">
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="mb-4 text-gray-700">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            className="py-2 px-4 bg-gray-200 rounded hover:bg-gray-300"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            className="py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
