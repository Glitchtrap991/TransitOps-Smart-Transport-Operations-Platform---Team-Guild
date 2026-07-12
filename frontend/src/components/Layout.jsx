import { Outlet, NavLink } from 'react-router-dom';
import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  Sun,
  Moon,
  LayoutDashboard,
  Truck,
  Users,
  MapPin,
  Wrench,
  DollarSign,
  Menu,
  LogOut,
  FileText,
} from 'lucide-react';

export default function Layout() {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);

  const toggleDark = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/vehicles', label: 'Vehicles', icon: Truck },
    { to: '/drivers', label: 'Drivers', icon: Users },
    { to: '/trips', label: 'Trips', icon: MapPin },
    { to: '/maintenance', label: 'Maintenance', icon: Wrench },
    { to: '/expenses', label: 'Expenses', icon: DollarSign },
    { to: '/reports', label: 'Reports', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-slate-100 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Glassmorphic */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200/50 bg-white/70 backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/70 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center gap-4 border-b border-slate-200/50 px-6 dark:border-slate-800/50">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/25">
            <Truck className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
            TransitOps
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-6">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                      : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
                  }`
                }
              >
                <Icon className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${false ? '' : ''}`} />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        {/* User & Theme Toggle */}
        <div className="border-t border-slate-200/50 p-4 dark:border-slate-800/50 space-y-2">
          {user && (
            <div className="flex items-center gap-3 px-2 py-2 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-bold">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate w-32">{user.email}</span>
                <span className="text-xs text-slate-500 dark:text-slate-500">{user.role}</span>
              </div>
            </div>
          )}
          <button
            onClick={toggleDark}
            className="flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200 transition-all duration-200"
          >
            {darkMode ? (
              <Sun className="h-5 w-5 text-amber-500" />
            ) : (
              <Moon className="h-5 w-5 text-indigo-500" />
            )}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          
          <button
            onClick={logout}
            className="flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300 transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col overflow-hidden relative">
        {/* Top Header - Glassmorphic */}
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200/50 bg-white/40 px-6 backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/40 z-10 sticky top-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl p-2.5 text-slate-600 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:bg-slate-800/50 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200 hidden sm:block">
            Enterprise Fleet Dashboard
          </h1>
          <div className="flex items-center gap-3 ml-auto sm:ml-0">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 hidden sm:inline-block">
              Welcome back
            </span>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm ring-2 ring-white dark:ring-slate-800" />
          </div>
        </header>

        {/* Page Content */}
        <section className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
