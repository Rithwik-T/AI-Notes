import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, FileText, PlusCircle, Settings, LogOut, Command, LogIn, Moon, Sun } from 'lucide-react';
import { RoutePath } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const { isAuthenticated, logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate(RoutePath.LANDING);
  };

  const handleLogin = () => {
    navigate(RoutePath.LOGIN);
  };

  const navItems = [
    { icon: Home, label: 'Home', path: RoutePath.HOME },
    { icon: FileText, label: 'My Notes', path: RoutePath.NOTES },
    { icon: PlusCircle, label: 'Create Note', path: RoutePath.CREATE_NOTE },
    { icon: Settings, label: 'Account', path: RoutePath.ACCOUNT },
  ];

  const getIsActive = (path: string) => {
    if (path === RoutePath.HOME) {
      return pathname === RoutePath.HOME;
    }
    if (path === RoutePath.NOTES) {
      return pathname.startsWith(RoutePath.NOTES) && pathname !== RoutePath.CREATE_NOTE;
    }
    if (path === RoutePath.CREATE_NOTE) {
      return pathname === RoutePath.CREATE_NOTE;
    }
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}
      <aside className={`fixed left-0 top-0 z-50 h-screen w-64 border-r border-white/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 md:bg-white/45 md:dark:bg-slate-900/45 backdrop-blur-2xl flex flex-col shadow-[0_4px_15px_rgba(0,0,0,0.03)] transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-24 items-center px-8">
        <div className="flex items-center gap-3 text-slate-900 dark:text-white font-bold tracking-tight group cursor-default">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 transition-transform group-hover:scale-105 group-hover:rotate-3">
            <Command size={20} />
          </div>
          <span className="text-xl tracking-tight text-slate-800 dark:text-slate-100">AURA Ai</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = getIsActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (onClose) onClose();
                }}
                className={`flex items-center gap-3 rounded-full px-5 py-3.5 text-sm transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold shadow-[0_4px_15px_rgba(129,140,248,0.25)] translate-x-1'
                    : 'text-slate-600 dark:text-slate-400 font-medium hover:bg-white/50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white hover:translate-x-1'
                }`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={`transition-colors ${isActive ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-6 border-t border-white/30 dark:border-white/10 space-y-2">
        {user?.plan === 'ultra' && (
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-full px-5 py-3.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/10 transition-all shadow-sm"
          >
            {theme === 'dark' ? (
              <Sun size={20} strokeWidth={2} className="opacity-70" />
            ) : (
              <Moon size={20} strokeWidth={2} className="opacity-70" />
            )}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        )}
        {isAuthenticated ? (
            <button
            onClick={() => {
              handleLogout();
              if (onClose) onClose();
            }}
            className="flex w-full items-center gap-3 rounded-full px-5 py-3.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/10 hover:text-red-600 dark:hover:text-red-400 transition-all hover:shadow-sm"
            >
            <LogOut size={20} strokeWidth={2} className="opacity-70" />
            Sign Out
            </button>
        ) : (
            <button
            onClick={() => {
              handleLogin();
              if (onClose) onClose();
            }}
            className="flex w-full items-center gap-3 rounded-full px-5 py-3.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-all shadow-sm"
            >
            <LogIn size={20} strokeWidth={2} className="opacity-70" />
            Sign In
            </button>
        )}
      </div>
    </aside>
    </>
  );
};