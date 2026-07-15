import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import ProtectedRoute from './components/layout/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import AiWorkspace from './pages/AiWorkspace';
import AiErrorBoundary from './components/common/AiErrorBoundary';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Tasks from './pages/Tasks';
import TaskDetails from './pages/TaskDetails';
import CalendarPage from './pages/Calendar';
import Reports from './pages/Reports';
import NotificationsPage from './pages/Notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import SearchPage from './pages/Search';
import Workspace from './pages/Workspace';
import Team from './pages/Team';
import ActivityCenter from './pages/ActivityCenter';
import NotFound from './pages/NotFound';

export function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#0f172a',
                color: '#f8fafc',
                fontSize: '13px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
              },
            }}
          />

          <Routes>
            {/* Public SaaS Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Public Authentication Split Screens & Recovery */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Protected Main Application Layout Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route
                  path="/ai-workspace"
                  element={
                    <AiErrorBoundary>
                      <AiWorkspace />
                    </AiErrorBoundary>
                  }
                />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:id" element={<ProjectDetails />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/tasks/:id" element={<TaskDetails />} />
                <Route path="/workspace" element={<Workspace />} />
                <Route path="/team" element={<Team />} />
                <Route path="/activity" element={<ActivityCenter />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/search" element={<SearchPage />} />
              </Route>
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
