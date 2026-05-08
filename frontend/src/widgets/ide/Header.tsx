import { useUserStore } from '@/entities/user/model/useUserStore';
import { useTheme } from '@/app/providers/ThemeProvider';
import { Button } from '@/shared/ui/button';
import { Moon, Sun, Settings, LayoutDashboard, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { useNavigate } from 'react-router-dom';

import { useProjectStore } from '@/entities/project/model/useProjectStore';

export function IDEHeader() {
  const { theme, setTheme } = useTheme();
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  const currentProject = useProjectStore((state) => state.currentProject);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-between px-4 h-14 border-b border-border bg-background z-10 shrink-0">
      <div className="flex items-center gap-4">
        <div 
          className="flex items-center gap-2 font-bold text-lg tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate('/')}
        >
          <LayoutDashboard className="h-5 w-5 text-primary" />
          <span>AIT <span className="text-primary">Practice</span></span>
        </div>
        {currentProject && (
          <>
            <div className="h-4 w-px bg-border mx-2" />
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline-block">
              {currentProject.title}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-muted-foreground hover:text-foreground"
        >
          {theme === 'dark' ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
        </Button>
        
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="h-4 w-4" />
        </Button>

        <div className="h-4 w-px bg-border mx-1" />

        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 border border-border">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {user?.username?.substring(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
