import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { SignIn } from './pages/auth/SignIn';
import { SignUp } from './pages/auth/SignUp';
import { Home } from './pages/dashboard/Home';
import { MyNotes } from './pages/dashboard/MyNotes';
import { CreateNote } from './pages/dashboard/CreateNote';
import { SingleNote } from './pages/dashboard/SingleNote';
import { Account } from './pages/dashboard/Account';
import { Landing } from './pages/Landing';
import { RoutePath } from './types';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path={RoutePath.LANDING} element={<Landing />} />
            <Route path={RoutePath.LOGIN} element={<SignIn />} />
            <Route path={RoutePath.SIGNUP} element={<SignUp />} />

            {/* Dashboard Layout (Shared by Guest and Auth users) */}
            <Route element={<DashboardLayout />}>
              {/* Public Home Page (Handles both Guest and Auth states internally) */}
              <Route path={RoutePath.HOME} element={<Home />} />
              
              {/* Protected Routes - Redirect to Login if Guest */}
              <Route path={RoutePath.NOTES} element={<ProtectedRoute><MyNotes /></ProtectedRoute>} />
              <Route path={RoutePath.CREATE_NOTE} element={<ProtectedRoute><CreateNote /></ProtectedRoute>} />
              <Route path={RoutePath.EDIT_NOTE} element={<ProtectedRoute><CreateNote /></ProtectedRoute>} />
              <Route path={RoutePath.NOTE_DETAIL} element={<ProtectedRoute><SingleNote /></ProtectedRoute>} />
              <Route path={RoutePath.ACCOUNT} element={<ProtectedRoute><Account /></ProtectedRoute>} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to={RoutePath.LANDING} replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;