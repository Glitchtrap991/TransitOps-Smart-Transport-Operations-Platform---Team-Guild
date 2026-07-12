import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
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
  Bell,
} from 'lucide-react';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const darkMode = theme === 'dark';
  
  const [alerts, setAlerts] = useState([]);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const { data } = await axios.get('http://localhost:5000/api/analytics/system-alerts', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAlerts(data);
      } catch (err) {
        console.error('Failed to fetch system alerts', err);
      }
    };
    fetchAlerts();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAlertsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResetDemo = async () => {
    if (window.confirm("Reset database to default hackathon demo state?")) {
      try {
        await axios.post('http://localhost:5000/api/demo/reset');
        toast.success("✅ Database refreshed with realistic fleet data!");
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        toast.error("Failed to reset demo data.");
      }
    }
  };

  const navLinks = [
    { to: '/', label: 'Command Center', icon: LayoutDashboard },
    { to: '/fleet', label: 'Fleet & Drivers', icon: Users },
    { to: '/operations', label: 'Operations', icon: MapPin },
    { to: '/logs', label: 'Logs & Expenses', icon: Wrench },
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
            onClick={toggleTheme}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-200/50 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-100 dark:border-slate-700/50 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <span className="flex items-center gap-3.5">
              {darkMode ? (
                <Sun className="h-5 w-5 text-amber-500" />
              ) : (
                <Moon className="h-5 w-5 text-indigo-500" />
              )}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
            <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 ${darkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}>
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-300 ${darkMode ? 'translate-x-4.5' : 'translate-x-1'}`} />
            </div>
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
          <div className="flex items-center gap-4 ml-auto sm:ml-0">
            <button
              onClick={handleResetDemo}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2 text-sm font-bold text-white shadow-lg transition-colors"
            >
              ⚡ Reset Demo Data
            </button>
            
            {/* Notifications Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setAlertsOpen(!alertsOpen)}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/50 bg-white hover:bg-slate-50 dark:border-slate-700/50 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              >
                <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
                    {alerts.length}
                  </span>
                )}
              </button>

              {alertsOpen && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-800 z-50">
                  <div className="mb-2 px-3 pt-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">System Alerts</h3>
                  </div>
                  <div className="flex max-h-96 flex-col gap-1 overflow-y-auto">
                    {alerts.length === 0 ? (
                      <div className="px-3 py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                        No active alerts
                      </div>
                    ) : (
                      alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`rounded-xl px-3 py-2.5 text-sm ${
                            alert.type === 'critical' ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                            alert.type === 'warning' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' :
                            'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                          }`}
                        >
                          {alert.message}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

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
