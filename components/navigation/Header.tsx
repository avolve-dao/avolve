import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full bg-gray-800 text-white py-4 px-6 flex items-center justify-between shadow">
      <h1 className="text-2xl font-bold">Avolve Dashboard</h1>
      {/* TODO: Add user menu, notifications, or additional header content here */}
      <div className="flex items-center gap-4">
        {/* Placeholder for user profile, notifications, etc. */}
      </div>
    </header>
  );
};

export default Header;
