import React, { useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages
import SignupPage from './pages/auth/signupPage.jsx';
import LoginPage from './pages/auth/loginPage.jsx';
import HomePage from './pages/mainPages/dashboard.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';
import VerificationCode from './pages/code/verifyCode.jsx';

import ArchiveMainContent from './pages/quickAccess/ArchiveMainContent.jsx';

import IntroPage from './pages/index.jsx';
import TaskScheduler from './pages/mainPages/TaskScheduler.jsx';
import DigitalNotebook from './pages/mainPages/DigitalNotebook.jsx';
import Community from './pages/mainPages/Community.jsx';
import Messages from './pages/mainPages/Messages.jsx';

// Components
import Navbar from './components/header/Navbar.jsx';
import LoadingSpinner from './components/loadingSpinner.jsx';
import Sidebar from './components/navigation/sidebar.jsx';

// Store
import { useAuthStore } from './store/authStore.js';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};

// Redirect Authenticated Users
const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user?.isVerified) {
    return <Navigate to="/user_dashboard" replace />;
  }
  return children;
};

// Main Layout
const MainLayout = ({ children }) => (
  <div className="flex h-screen bg-[#f4f7f5] text-[#3e4c45]">
    <Sidebar />
    <div className="flex flex-1 flex-col p-3">
      <Navbar />
      <main className="flex-1 p-4 overflow-auto">{children}</main>
    </div>
  </div>
);

// Route Configuration
const routes = [
  { path: '/', element: <IntroPage /> },
  {
    path: '/user_dashboard',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <HomePage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/task-scheduler',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <TaskScheduler />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/digital-notebook',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <DigitalNotebook />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/community',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <Community />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/messages',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <Messages />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/archive',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <ArchiveMainContent />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/signup',
    element: (
      <RedirectAuthenticatedUser>
        <SignupPage />
      </RedirectAuthenticatedUser>
    ),
  },
  {
    path: '/login',
    element: (
      <RedirectAuthenticatedUser>
        <LoginPage />
      </RedirectAuthenticatedUser>
    ),
  },
  {
    path: '/verify-email',
    element: (
      <RedirectAuthenticatedUser>
        <VerificationCode />
      </RedirectAuthenticatedUser>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <RedirectAuthenticatedUser>
        <ForgotPassword />
      </RedirectAuthenticatedUser>
    ),
  },
  {
    path: '/reset-password/:token',
    element: (
      <RedirectAuthenticatedUser>
        <ResetPassword />
      </RedirectAuthenticatedUser>
    ),
  },
];

function App() {
  const { isCheckingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isCheckingAuth) return <LoadingSpinner />;

  return (
    <>
      <Routes>
        {routes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
