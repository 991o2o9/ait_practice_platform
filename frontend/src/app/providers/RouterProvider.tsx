import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LoginPage } from '@/pages/login/LoginPage';
import { RegisterPage } from '@/pages/register/RegisterPage';
import { useUserStore } from '@/entities/user/model/useUserStore';
import { useEffect } from 'react';

// Защищенный роут, перекидывает на логин, если нет авторизации
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const isLoading = useUserStore((state) => state.isLoading);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Сохраняем URL, куда хотел попасть юзер, чтобы вернуть его туда после логина
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Заглушка для Dashboard, пока не сверстаем IDE
const DashboardPlaceholder = () => {
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  
  return (
    <div className="p-8 text-center min-h-screen bg-background">
      <h1 className="text-4xl font-bold tracking-tight mb-4 text-foreground">Welcome to IDE</h1>
      <p className="text-muted-foreground mb-8">You are logged in as {user?.email} ({user?.role})</p>
      <button 
        onClick={logout}
        className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
      >
        Logout
      </button>
    </div>
  );
};

export const RouterProvider = () => {
  const checkAuth = useUserStore((state) => state.checkAuth);

  // При первой загрузке приложения проверяем токен
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route 
        path="/*" 
        element={
          <ProtectedRoute>
            <Routes>
              <Route path="/" element={<DashboardPlaceholder />} />
              {/* Будущие роуты: /projects, /projects/:id/workspace */}
            </Routes>
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};
