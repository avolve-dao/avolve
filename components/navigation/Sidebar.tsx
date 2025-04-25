import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-gray-900 text-white h-full flex flex-col p-4">
      <h2 className="text-xl font-bold mb-4">Avolve</h2>
      {/* TODO: Add navigation links relevant to your app */}
      <nav className="flex flex-col gap-2">
        <a href="/app/(superachiever)/superachiever" className="hover:text-blue-400">
          Superachiever
        </a>
        <a href="/app/(superachievers)/superachievers" className="hover:text-blue-400">
          Superachievers
        </a>
        <a href="/app/(supercivilization)/supercivilization" className="hover:text-blue-400">
          Supercivilization
        </a>
        <a href="/admin" className="hover:text-blue-400">
          Admin
        </a>
      </nav>
    </aside>
  );
};

export default Sidebar;
