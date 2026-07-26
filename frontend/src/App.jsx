import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import PlannerPage from './pages/PlannerPage';
import TripsPage from './pages/TripsPage';

function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <Navbar />
      <main className="app">{children}</main>
      <footer className="footer">
        <p>Dream Vacation Planner · React + Express + Amazon RDS MySQL</p>
      </footer>
    </ProtectedRoute>
  );
}

export default function App() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          loading ? (
            <p className="list-status">Loading…</p>
          ) : isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <AuthPage />
          )
        }
      />

      <Route
        path="/dashboard"
        element={<ProtectedLayout><DashboardPage /></ProtectedLayout>}
      />
      <Route
        path="/planner"
        element={<ProtectedLayout><PlannerPage /></ProtectedLayout>}
      />
      <Route
        path="/trips"
        element={<ProtectedLayout><TripsPage /></ProtectedLayout>}
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
