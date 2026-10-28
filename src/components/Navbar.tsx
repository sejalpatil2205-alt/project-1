import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Menu,
  X,
  Heart,
  Scale,
  LogOut,
  ShieldCheck,
  LayoutDashboard,
} from 'lucide-react';
import type { UserProfile, UserRole } from '../types';

export type ActiveView = 'discover' | 'saved_messes' | 'owner_dashboard' | 'admin_dashboard';

interface NavbarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  user: UserProfile | null;
  favouriteCount: number;
  compareCount: number;
  onOpenCompare: () => void;
  onOpenAuth: (defaultRole: UserRole) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigate,
  user,
  favouriteCount,
  compareCount,
  onOpenCompare,
  onOpenAuth,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view: ActiveView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#191919] border-b-2 border-[#F0442B] text-[#FFF4E3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo + Name + Subtitle */}
        <button
          type="button"
          onClick={() => handleNav('discover')}
          className="flex items-center gap-3 text-left group focus-visible:outline-2 focus-visible:outline-[#FFD400] rounded-lg shrink-0 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F0442B] via-[#FFD400] to-[#19B783] p-0.5 shadow-sm shrink-0">
            <div className="w-full h-full bg-[#191919] rounded-[10px] flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-[#FFD400] group-hover:rotate-6 transition-transform duration-150" />
            </div>
          </div>
          <div className="leading-tight">
            <div className="text-base sm:text-lg font-extrabold tracking-tight text-white whitespace-nowrap">
              Mess Finding System
            </div>
            <div className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-[#FFD400]/90 whitespace-nowrap">
              FIND YOUR DAILY MEAL, SORTED.
            </div>
          </div>
        </button>

        {/* Desktop Navigation Links & Actions */}
        <div className="hidden md:flex items-center gap-2.5 lg:gap-3.5">
          <button
            type="button"
            onClick={() => handleNav('discover')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeView === 'discover'
                ? 'bg-[#F0442B] text-white shadow-sm'
                : 'bg-[#F0442B]/90 hover:bg-[#F0442B] text-white'
            }`}
          >
            Discover
          </button>

          <button
            type="button"
            onClick={onOpenCompare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-[#FFF4E3]/90 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Scale className="w-4 h-4 text-[#304FFE]" />
            <span>Compare{compareCount > 0 ? ` (${compareCount})` : ''}</span>
          </button>

          <button
            type="button"
            onClick={() => handleNav('saved_messes')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeView === 'saved_messes'
                ? 'bg-white/15 text-white'
                : 'text-[#FFF4E3]/90 hover:text-white hover:bg-white/10'
            }`}
          >
            <Heart className="w-4 h-4 text-[#F0442B]" />
            <span>Saved{favouriteCount > 0 ? ` (${favouriteCount})` : ''}</span>
          </button>

          {/* Owner Action */}
          {user?.role === 'owner' ? (
            <button
              type="button"
              onClick={() => handleNav('owner_dashboard')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-extrabold bg-[#FFD400] text-[#191919] hover:bg-[#ffe033] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Owner Dashboard</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenAuth('owner')}
              className="px-4 py-2 rounded-lg text-sm font-extrabold bg-[#FFD400] text-[#191919] hover:bg-[#ffe033] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Owner Login
            </button>
          )}

          {/* Admin Action */}
          {user?.role === 'admin' ? (
            <button
              type="button"
              onClick={() => handleNav('admin_dashboard')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-extrabold bg-[#304FFE] text-white hover:bg-[#233fe0] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Panel</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenAuth('admin')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-bold bg-[#304FFE] text-white hover:bg-[#233fe0] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Login</span>
            </button>
          )}

          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-white/15">
              <span className="text-xs font-medium text-[#FFF4E3]/80 max-w-[110px] truncate">
                {user.role === 'admin' ? 'Admin' : user.name.split(' ')[0]}
              </span>
              <button
                type="button"
                onClick={onLogout}
                title="Sign Out"
                className="p-2 rounded-lg text-[#FFF4E3]/75 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          className="md:hidden p-2.5 rounded-lg text-[#FFF4E3] hover:bg-white/10 transition-colors cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#191919] border-t border-white/10 px-4 pt-3 pb-5 space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleNav('discover')}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-bold bg-[#F0442B] text-white text-center"
            >
              Discover Messes
            </button>
            {user?.role === 'owner' ? (
              <button
                type="button"
                onClick={() => handleNav('owner_dashboard')}
                className="w-full py-2.5 px-4 rounded-lg text-sm font-extrabold bg-[#FFD400] text-[#191919] text-center"
              >
                Owner Dashboard
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('owner');
                }}
                className="w-full py-2.5 px-4 rounded-lg text-sm font-extrabold bg-[#FFD400] text-[#191919] text-center"
              >
                Owner Login
              </button>
            )}
          </div>

          {user?.role === 'admin' ? (
            <button
              type="button"
              onClick={() => handleNav('admin_dashboard')}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-extrabold bg-[#304FFE] text-white flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Open Admin Panel</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth('admin');
              }}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-bold bg-[#304FFE] text-white flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Login</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCompare();
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-semibold text-[#FFF4E3] bg-white/5 hover:bg-white/10"
            >
              <Scale className="w-4 h-4 text-[#304FFE]" />
              <span>Compare ({compareCount}/3)</span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('saved_messes')}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-semibold text-[#FFF4E3] bg-white/5 hover:bg-white/10"
            >
              <Heart className="w-4 h-4 text-[#F0442B]" />
              <span>Saved ({favouriteCount})</span>
            </button>
          </div>

          {user && (
            <div className="flex items-center justify-between px-2 pt-2 border-t border-white/10">
              <div className="text-xs text-[#FFF4E3]/80">
                Signed in as <strong className="text-white">{user.name}</strong> ({user.role})
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="text-xs font-semibold text-[#F0442B] py-1 px-2"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
