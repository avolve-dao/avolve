'use client';
import Link from 'next/link';
import { FiSearch, FiBell, FiMessageSquare, FiUsers, FiCalendar, FiHome } from 'react-icons/fi';
import { FaRegUserCircle } from 'react-icons/fa';

export default function Navbar() {
  return (
    <nav className="w-full h-14 flex items-center justify-between px-6 bg-zinc-900 border-b border-zinc-800 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="text-lg font-bold text-white hover:text-violet-400 transition-colors duration-150"
        >
          <FiHome className="inline-block mr-2" size={22} /> Home
        </Link>
        <div className="relative ml-4">
          <input
            type="text"
            placeholder="Search..."
            className="bg-zinc-800 text-zinc-200 rounded-full px-3 py-1 pl-8 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <FiSearch className="absolute left-2 top-1.5 text-zinc-400" size={18} />
        </div>
      </div>
      <div className="flex items-center gap-6 md:gap-6 lg:gap-6">
        <Link
          href="/feed"
          className="text-zinc-400 hover:text-violet-400 transition-colors duration-150"
          aria-label="Feed"
        >
          <FiUsers size={22} />
        </Link>
        <Link
          href="/dashboard"
          className="text-zinc-400 hover:text-violet-400 transition-colors duration-150"
          aria-label="Dashboard"
        >
          <FiCalendar size={22} />
        </Link>
        <Link
          href="/tokens"
          className="text-zinc-400 hover:text-violet-400 transition-colors duration-150"
          aria-label="Tokens"
        >
          <FiBell size={22} />
        </Link>
        <Link
          href="/teams"
          className="text-zinc-400 hover:text-violet-400 transition-colors duration-150"
          aria-label="Teams"
        >
          <FiMessageSquare size={22} />
        </Link>
        <Link
          href="/profile"
          className="text-zinc-400 hover:text-violet-400 transition-colors duration-150"
          aria-label="Profile"
        >
          <FaRegUserCircle size={26} />
        </Link>
      </div>
    </nav>
  );
}
