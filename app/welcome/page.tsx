// Avolve Welcome Page - Modern, conversion-optimized landing for unauthenticated users
import Link from 'next/link';

export default function WelcomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-blue-50 p-6">
      <div className="max-w-xl w-full text-center">
        <h1 className="text-5xl font-extrabold text-blue-900 mb-4">Welcome to Avolve</h1>
        <p className="text-lg text-blue-800 mb-8">
          Unlock your superhuman potential. Join a thriving community, access powerful tools, and
          accelerate your growth in 2025 and beyond.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/signup"
            className="px-6 py-3 rounded-lg bg-blue-700 text-white font-semibold shadow hover:bg-blue-800 transition"
          >
            Get Started
          </Link>
          <Link
            href="/signin"
            className="px-6 py-3 rounded-lg border border-blue-700 text-blue-700 font-semibold bg-white hover:bg-blue-50 transition"
          >
            Sign In
          </Link>
        </div>
        <p className="text-sm text-blue-500">
          Already a member?{' '}
          <Link href="/signin" className="underline">
            Sign in here
          </Link>
          .
        </p>
      </div>
      <footer className="mt-16 text-xs text-blue-400">
        &copy; {new Date().getFullYear()} Avolve. All rights reserved.
      </footer>
    </main>
  );
}
