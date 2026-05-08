import { LoginForm } from '@/features/auth/ui/LoginForm';
import { useTheme } from '@/app/providers/ThemeProvider';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/shared/ui/button';

export function LoginPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background transition-colors duration-300">
      {/* Absolute Theme Switcher for Login Page */}
      <div className="absolute top-4 right-4 z-50">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-full bg-background/50 backdrop-blur-sm border-white/10"
        >
          {theme === 'dark' ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>

      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] rounded-full bg-accent/20 blur-[120px]" />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 z-10">
        <div className="mb-8 text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            AIT <span className="text-primary">Practice</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-[500px]">
            Master your system design skills with our AI-driven practice platform.
          </p>
        </div>
        
        <LoginForm />
      </main>
    </div>
  );
}
