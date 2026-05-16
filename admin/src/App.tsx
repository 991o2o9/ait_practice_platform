import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '@/widgets/layout/AdminLayout';
import { LoginPage } from '@/pages/login/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { AIGeneratorPage } from '@/pages/generator/AIGeneratorPage';
import { ProjectsListPage } from '@/pages/projects/ProjectsListPage';
import { UsersListPage } from '@/pages/users/UsersListPage';
import { useUserStore } from '@/entities/user/model/useUserStore';
import React, { useEffect } from 'react';
import { Toaster } from 'sonner';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useUserStore();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export function App() {
  const checkAuth = useUserStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="users" element={<UsersListPage />} />
            <Route path="projects" element={<ProjectsListPage />} />
            <Route path="generate" element={<AIGeneratorPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster theme="dark" position="bottom-right" />
    </>
  );
}
