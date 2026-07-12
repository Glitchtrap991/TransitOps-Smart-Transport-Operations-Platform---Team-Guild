import { Outlet, NavLink } from 'react-router-dom';
import { useState } from 'react';
import {
  Sun,
  Moon,
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  DollarSign,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

export default function Layout() {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    { to: '/trips', label: 'Trips', icon: Route },
    { to: '/maintenance', label: 'Maintenance', icon: Wrench },
    { to: '/expenses', label: 'Expenses', icon: DollarSign },
  ];

  return (
    <div className="flex h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 font-sans">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 flex flex-col
          bg-white dark:bg-surface-900
          border-r border-surface-200 dark:border-surface-800
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-surface-200 dark:border-surface-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md shadow-primary-500/20">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              TransitOps
            </h1>
            <p className="text-[10px] text-surface-400 font-medium tracking-wider uppercase">Fleet Management</p>
          </div>
          {/* Mobile close */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                   transition-all duration-200 group
                   ${
                     isActive
                       ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm'
                       : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100'
                   }`
                }
              >
                <Icon className="w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-110" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-3 pb-4 pt-2 border-t border-surface-200 dark:border-surface-800 space-y-1">
          <button
            onClick={toggleDark}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full
                       text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800
                       hover:text-surface-900 dark:hover:text-surface-100 transition-all duration-200 group"
          >
            {darkMode ? (
              <Sun className="w-[18px] h-[18px] text-amber-500 transition-transform duration-200 group-hover:rotate-45" />
            ) : (
              <Moon className="w-[18px] h-[18px] transition-transform duration-200 group-hover:-rotate-12" />
            )}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white/80 dark:bg-surface-900/80 backdrop-blur-md border-b border-surface-200 dark:border-surface-800 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-surface-800 dark:text-surface-100">
              Fleet Control Center
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              System Online
            </div>
          </div>
        </header>

        {/* Page content */}
        <section className="flex-1 overflow-auto p-6 bg-surface-50 dark:bg-surface-950">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </section>
      </main>
    </div>
  );
}
