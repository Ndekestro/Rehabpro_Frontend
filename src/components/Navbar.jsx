import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <nav className="bg-blue-600 text-white p-4 shadow">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-bold">Participant Portal</h1>
        <div className="space-x-4">
          <Link to="/participant/programs" className="hover:underline">My Programs</Link>
          <Link to="/chats" className="hover:underline">Chats</Link>
          <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded hover:bg-red-600">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
