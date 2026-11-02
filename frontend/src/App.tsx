import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { PassengerDashboard } from './dashboards/passenger/PassengerDashboard';
import { AuthorityDashboard } from './dashboards/authority/AuthorityDashboard';

const ProtectedPassengerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-darkest flex items-center justify-center text-white">
        <div className="w-8 h-8 border-4 border-sky-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, role, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-darkest flex items-center justify-center text-white">
        <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (role !== 'admin') return <Navigate to="/passenger" replace />;
  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/passenger"
          element={
            <ProtectedPassengerRoute>
              <PassengerDashboard />
            </ProtectedPassengerRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AuthorityDashboard />
            </ProtectedAdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Visible Floating Watermark */}
      <div className="fixed bottom-4 right-4 z-50 pointer-events-none select-none">
        <div className="glass-panel px-4 py-2 rounded-full border border-sky-500/50 bg-slate-950/90 shadow-2xl backdrop-blur-md flex items-center gap-2.5 text-xs text-slate-100">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
          <span className="font-extrabold tracking-wide bg-gradient-to-r from-white via-sky-200 to-sky-400 bg-clip-text text-transparent">
            Project by Kushal P & indukiran C
          </span>
        </div>
      </div>
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
