import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { RouteGuard } from './components/RouteGuard';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// Pages
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { JobManagement } from './pages/JobManagement';
import { ResumeScanner } from './pages/ResumeScanner';
import { AiAssistant } from './pages/AiAssistant';
import { AuditLogs } from './pages/AuditLogs';

const AppLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />
      <div className="flex flex-1 max-w-full">
        {isAuthenticated && <Sidebar />}
        <main className="flex-grow flex flex-col overflow-x-hidden">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Guarded Routes */}
            <Route path="/dashboard" element={
              <RouteGuard>
                <Dashboard />
              </RouteGuard>
            } />
            <Route path="/jobs" element={
              <RouteGuard allowedRoles={["Admin", "Recruiter"]}>
                <JobManagement />
              </RouteGuard>
            } />
            <Route path="/resumes" element={
              <RouteGuard allowedRoles={["Admin", "Recruiter"]}>
                <ResumeScanner />
              </RouteGuard>
            } />
            <Route path="/resume-scanner" element={
              <RouteGuard allowedRoles={["Candidate"]}>
                <ResumeScanner />
              </RouteGuard>
            } />
            <Route path="/ai-assistant" element={
              <RouteGuard>
                <AiAssistant />
              </RouteGuard>
            } />
            <Route path="/audit-logs" element={
              <RouteGuard allowedRoles={["Admin"]}>
                <AuditLogs />
              </RouteGuard>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppLayout />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
