import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Deliveries from './pages/Deliveries';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Admin from './pages/Admin';
import DailyOps from './pages/DailyOps';

// Types
import { UserSession } from './types';

// Auth Context
interface AuthContextType {
  user: UserSession | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = () => useContext(AuthContext);

// Layout Components
const SidebarItem: React.FC<{ to: string, icon: string, label: string, active: boolean }> = ({ to, icon, label, active }) => (
  <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active ? 'bg-tmd-green text-white shadow-lg shadow-tmd-green/20' : 'text-tmd-muted hover:bg-tmd-surface hover:text-white'}`}>
    <i className={`fa-solid ${icon} w-5 text-center`}></i>
    <span className="font-medium text-sm">{label}</span>
  </Link>
);

const MobileNavItem: React.FC<{ to: string, icon: string, label: string, active: boolean }> = ({ to, icon, label, active }) => (
  <Link to={to} className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${active ? 'text-tmd-green' : 'text-tmd-muted'}`}>
    <i className={`fa-solid ${icon} text-lg mb-1`}></i>
    <span className="text-[10px] font-medium">{label}</span>
  </Link>
);

const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { to: '/', icon: 'fa-chart-pie', label: 'Dashboard' },
    { to: '/inventory', icon: 'fa-gas-pump', label: 'Inventory' },
    { to: '/deliveries', icon: 'fa-truck', label: 'Deliveries' },
    { to: '/expenses', icon: 'fa-wallet', label: 'Expenses' },
    { to: '/daily', icon: 'fa-clipboard-list', label: 'Daily Log' },
    { to: '/reports', icon: 'fa-chart-line', label: 'Reports' },
    { to: '/admin', icon: 'fa-shield-halved', label: 'Admin' },
  ];

  return (
    <div className="flex h-screen bg-tmd-charcoal text-white font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-tmd-surface border-r border-tmd-border h-full p-4">
        <div className="flex items-center gap-3 px-2 mb-8 mt-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-tmd-green to-emerald-600 flex items-center justify-center text-white font-bold font-heading">
            T
          </div>
          <h1 className="font-heading font-bold text-lg text-white tracking-tight">TMD Emirates</h1>
        </div>
        
        <nav className="flex-1 space-y-1">
          {navItems.map(item => (
            <SidebarItem key={item.to} {...item} active={location.pathname === item.to} />
          ))}
        </nav>

        <div className="pt-4 border-t border-tmd-border">
          <button onClick={logout} className="flex items-center gap-3 px-4 py-2 w-full text-tmd-muted hover:text-red-400 transition-colors">
            <i className="fa-solid fa-arrow-right-from-bracket w-5"></i>
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 border-b border-tmd-border bg-tmd-charcoal/80 backdrop-blur-md sticky top-0 z-20">
          <h2 className="text-xl font-heading font-bold text-white">
            {navItems.find(i => i.to === location.pathname)?.label || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs text-tmd-green">Logged In</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-tmd-surface border border-tmd-border flex items-center justify-center">
              <i className="fa-solid fa-user text-tmd-muted"></i>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 scroll-smooth">
          <AnimatePresence mode="wait">
             <motion.div
               key={location.pathname}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2 }}
             >
               {children}
             </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 w-full bg-tmd-surface border-t border-tmd-border z-50 px-4 pb-safe">
        <div className="flex justify-between items-center">
          {navItems.slice(0, 5).map(item => (
            <MobileNavItem key={item.to} {...item} active={location.pathname === item.to} />
          ))}
           <Link to="/admin" className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${location.pathname === '/admin' ? 'text-tmd-green' : 'text-tmd-muted'}`}>
            <i className={`fa-solid fa-bars text-lg mb-1`}></i>
            <span className="text-[10px] font-medium">Menu</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children?: React.ReactElement }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

// Main App Component
export default function App() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for session
    const stored = localStorage.getItem('tmd_session');
    if (stored) {
      const session: UserSession = JSON.parse(stored);
      if (Date.now() < session.expiry) {
        setUser(session);
      } else {
        localStorage.removeItem('tmd_session');
      }
    }
    setLoading(false);
  }, []);

  const login = () => {
    const session: UserSession = {
      username: 'tmduser',
      expiry: Date.now() + 12 * 60 * 60 * 1000 // 12 hours
    };
    localStorage.setItem('tmd_session', JSON.stringify(session));
    setUser(session);
  };

  const logout = () => {
    localStorage.removeItem('tmd_session');
    setUser(null);
  };

  if (loading) return <div className="h-screen w-full bg-tmd-charcoal flex items-center justify-center text-tmd-green"><i className="fa-solid fa-circle-notch fa-spin text-3xl"></i></div>;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
          <Route path="/deliveries" element={<ProtectedRoute><Deliveries /></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
          <Route path="/daily" element={<ProtectedRoute><DailyOps /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        </Routes>
      </HashRouter>
    </AuthContext.Provider>
  );
}