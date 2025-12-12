import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Stethoscope,
  LogOut,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/appointments', label: 'Appointments', icon: Calendar },
  { path: '/doctors', label: 'Doctors', icon: Stethoscope },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleNavClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar flex flex-col border-r border-sidebar-border">
      {/* Logo */}
      <div className="p-4 sm:p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
            <Activity className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-sidebar-foreground text-lg">MediCare</h1>
            <p className="text-xs text-sidebar-foreground/60">Hospital Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={cn(
                'nav-item',
                isActive ? 'nav-item-active' : 'nav-item-inactive'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center">
            <Users className="w-4 h-4 text-sidebar-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.username}
            </p>
            <p className="text-xs text-sidebar-foreground/60 capitalize">
              {user?.role.toLowerCase()}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="nav-item nav-item-inactive w-full text-left hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
