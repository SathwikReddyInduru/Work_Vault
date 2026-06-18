// src/App.tsx
import { AppLayout } from '@/components/layout/AppLayout';
import { PageLoader } from '@/components/ui/Spinner';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LoginPage } from '@/pages/LoginPage';
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Websites = lazy(() => import('@/pages/Websites'));
const Applications = lazy(() => import('@/pages/Applications'));
const Notes = lazy(() => import('@/pages/Notes'));
const QuickLinks = lazy(() => import('@/pages/QuickLinks'));
const Tasks = lazy(() => import('@/pages/Tasks'));
const DbConnections = lazy(() => import('@/pages/DbConnections'));
const Tools = lazy(() => import('@/pages/Tools'));
const Settings = lazy(() => import('@/pages/Settings'));

const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-slate-950"><PageLoader /></div>;
  if (!isAuthenticated) return <LoginPage />;

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="websites" element={<Websites />} />
        <Route path="applications" element={<Applications />} />
        <Route path="notes" element={<Notes />} />
        <Route path="links" element={<QuickLinks />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="db-connections" element={<DbConnections />} />
        <Route path="tools" element={<Tools />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-slate-950"><PageLoader /></div>}>
          <AppRoutes />
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}