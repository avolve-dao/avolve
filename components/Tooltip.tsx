"use client";
import { useState } from "react";

export default function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-block">
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        tabIndex={0}
        aria-label={label}
        className="ml-1 cursor-pointer text-blue-500 align-middle focus:outline-none"
        role="button"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="inline">
          <circle cx="12" cy="12" r="12" fill="#EFF6FF" />
          <text x="12" y="17" textAnchor="middle" fontSize="13" fill="#2563EB" fontFamily="Arial" fontWeight="bold">?</text>
        </svg>
      </span>
      {show && (
        <span className="absolute left-1/2 z-50 -translate-x-1/2 mt-2 w-max max-w-xs rounded bg-gray-900 text-white text-xs px-3 py-2 shadow-lg animate-fade-in" role="tooltip">
          {label}
        </span>
      )}
      {children}
    </span>
  );
}
