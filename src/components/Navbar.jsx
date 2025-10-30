import React from 'react';
import { Home, ShoppingCart, QrCode, User, LogOut } from 'lucide-react';

export default function Navbar({ currentPage, setCurrentPage, currentUser, onLogout }) {
  const NavButton = ({ id, label, Icon }) => (
    <button
      onClick={() => setCurrentPage(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
        currentPage === id ? 'bg-zinc-800 text-white' : 'text-zinc-300 hover:bg-zinc-800/60'
      }`}
    >
      <Icon size={18} />
      <span className="hidden sm:block">{label}</span>
    </button>
  );

  return (
    <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/70 bg-zinc-900/90 border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500" />
            <div className="leading-tight">
              <div className="text-white font-semibold">IndVend Fitness</div>
              <div className="text-xs text-zinc-400 -mt-0.5">Ecosystem</div>
            </div>
          </div>

          {currentUser && (
            <nav className="flex items-center gap-2">
              <NavButton id="home" label="Home" Icon={Home} />
              <NavButton id="marketplace" label="Marketplace" Icon={ShoppingCart} />
              <NavButton id="attendance" label="Attendance" Icon={QrCode} />
              <NavButton id="profile" label="Profile" Icon={User} />
            </nav>
          )}

          <div className="flex items-center gap-3">
            {currentUser && (
              <div className="hidden sm:flex text-sm text-zinc-400">
                <span className="px-2 py-1 rounded bg-zinc-800/60 border border-zinc-700">{currentUser.role}</span>
              </div>
            )}

            {currentUser && (
              <button
                onClick={onLogout}
                className="flex items-center gap-2 text-zinc-300 hover:text-white px-3 py-2 rounded-md hover:bg-zinc-800/60"
                title="Logout"
              >
                <LogOut size={18} />
                <span className="hidden sm:block">Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
