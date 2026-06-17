import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ToastContainer } from '@/components/ui/Toast';

export const AppLayout: React.FC = () => (
  <div className="flex h-screen w-screen overflow-hidden bg-slate-950">
    <Sidebar />
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* <TopBar /> */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
    <ToastContainer />
  </div>
);
