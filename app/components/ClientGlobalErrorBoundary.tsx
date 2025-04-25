'use client';
import React, { useEffect } from 'react';

/**
 * ClientGlobalErrorBoundary
 * Catches unhandled errors and promise rejections on the client and logs them in a structured way.
 * Should be mounted at the root of the client app (e.g., _app.tsx or layout.tsx)
 */
export default function ClientGlobalErrorBoundary() {
  useEffect(() => {
    function handleError(event: ErrorEvent) {
      console.error(
        JSON.stringify({
          type: 'window.onerror',
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error
            ? {
                message: event.error.message,
                stack: event.error.stack,
              }
            : undefined,
          timestamp: new Date().toISOString(),
        })
      );
    }
    function handlePromiseRejection(event: PromiseRejectionEvent) {
      console.error(
        JSON.stringify({
          type: 'window.onunhandledrejection',
          reason: event.reason && event.reason.message ? event.reason.message : event.reason,
          stack: event.reason && event.reason.stack ? event.reason.stack : undefined,
          timestamp: new Date().toISOString(),
        })
      );
    }
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handlePromiseRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
    };
  }, []);
  return null;
}
