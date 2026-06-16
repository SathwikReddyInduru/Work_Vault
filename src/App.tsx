import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageLoader } from '@/components/ui/Spinner';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Websites = lazy(() => import('@/pages/Websites'));
const Applications = lazy(() => import('@/pages/Applications'));
const Notes = lazy(() => import('@/pages/Notes'));
const QuickLinks = lazy(() => import('@/pages/QuickLinks'));
const Tasks = lazy(() => import('@/pages/Tasks'));
const Tools = lazy(() => import('@/pages/Tools'));
const Settings = lazy(() => import('@/pages/Settings'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="flex h-screen items-center justify-center bg-slate-950"><PageLoader /></div>}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="websites" element={<Websites />} />
            <Route path="applications" element={<Applications />} />
            <Route path="notes" element={<Notes />} />
            <Route path="links" element={<QuickLinks />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="tools" element={<Tools />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
