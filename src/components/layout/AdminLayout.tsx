import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  BookOpen, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const adminNavItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { path: '/admin/books', label: 'Books', icon: BookOpen },
];

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground shadow-lg">
        <div className="flex items-center justify-between p-4">
          <h1 className="font-serif text-xl font-semibold">Admin Panel</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-primary-foreground"
          >
            {sidebarOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen w-64 bg-primary text-primary-foreground transition-transform lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center">
                <span className="font-serif text-deep-blue font-bold text-lg">AB</span>
              </div>
              <div>
                <h2 className="font-serif text-lg font-semibold">Admin Panel</h2>
                <p className="text-xs text-primary-foreground/70">Bigirumwami Legacy</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {adminNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-gold text-deep-blue font-medium'
                      : 'text-primary-foreground/80 hover:bg-white/10 hover:text-primary-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-white/10">
            <div className="mb-3 px-4">
              <p className="text-sm font-medium text-primary-foreground">
                {profile?.full_name || 'Admin'}
              </p>
              <p className="text-xs text-primary-foreground/60">{profile?.email}</p>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-primary-foreground hover:bg-white/10"
              onClick={handleSignOut}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
