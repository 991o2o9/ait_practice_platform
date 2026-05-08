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

import { IDEPage } from '@/pages/ide/IDEPage';

import { ProjectsPage } from '@/pages/projects/ProjectsPage';

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
              <Route path="/" element={<ProjectsPage />} />
              <Route path="/projects/:id/workspace" element={<IDEPage />} />
            </Routes>
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};
