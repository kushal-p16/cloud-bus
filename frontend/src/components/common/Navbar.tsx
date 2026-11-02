import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bus, ShieldCheck, User, LogOut, Sparkles, Navigation, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, role, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-brand-border/60 bg-brand-darkest/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => navigate(role === 'admin' ? '/admin' : role === 'passenger' ? '/passenger' : '/')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-sky-400 bg-clip-text text-transparent">
                SMARTBUS AI
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                SDG 11
              </span>
            </div>
            <p className="text-[11px] text-sky-400 font-medium">
              Project by Kushal P & indukiran C
            </p>
          </div>
        </div>

        {/* Center Watermark & SDG Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/90 border border-sky-500/40 text-xs text-slate-200 shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-sky-300">Project by Kushal P & indukiran C</span>
          <span className="text-slate-500">|</span>
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-300">UN SDG 11.2</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Role Indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/70 text-xs">
                {role === 'admin' ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-300 font-medium">Authority Admin</span>
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 text-sky-400" />
                    <span className="text-sky-300 font-medium">Passenger</span>
                  </>
                )}
                <span className="text-slate-500 hidden sm:inline">|</span>
                <span className="text-slate-300 font-semibold hidden sm:inline">
                  {user?.full_name?.split(' ')[0]}
                </span>
              </div>

              {/* Portal Switcher Button if needed */}
              {role === 'admin' ? (
                <button
                  onClick={() => navigate('/passenger')}
                  className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded border border-slate-700/50 hover:bg-slate-800 transition-colors"
                  title="Preview Passenger Portal"
                >
                  <Navigation className="w-3.5 h-3.5 text-sky-400" />
                  <span>Passenger View</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate('/')}
                  className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded border border-slate-700/50 hover:bg-slate-800 transition-colors"
                >
                  <span>Home</span>
                </button>
              )}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 rounded-lg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <a
                href="#auth-section"
                className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Access Portals</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
