import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '@/entities/user/model/useUserStore';
import { Shield, LayoutDashboard, Wand2, LogOut, FolderGit2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUserStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Projects', path: '/projects', icon: FolderGit2 },
    { name: 'AI Generator', path: '/generate', icon: Wand2 },
  ];

  return (
    <div className="min-h-screen flex bg-zinc-950 text-zinc-50">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800 shrink-0">
          <Shield className="h-6 w-6 text-primary mr-2" />
          <span className="font-bold text-lg tracking-tight">AIT <span className="text-primary">Admin</span></span>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800 shrink-0">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-300">
              {user?.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-zinc-200">{user?.username}</p>
              <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-zinc-400 hover:text-red-400 hover:bg-red-400/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
