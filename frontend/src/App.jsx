import React, { useEffect } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages
import SignupPage from './pages/auth/signupPage.jsx';
import LoginPage from './pages/auth/loginPage.jsx';
import HomePage from './pages/mainPages/dashboard.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';
import VerificationCode from './pages/code/verifyCode.jsx';

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

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.isVerified) return <Navigate to="/verify-email" replace />;

  return children;
};

const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user?.isVerified) {
    const lastRoute = localStorage.getItem('lastRoute') || '/user_dashboard';
    return <Navigate to={lastRoute} replace />;
  }
  return children;
};

const MainLayout = ({ children }) => (
  <div className="flex h-screen">
    <Sidebar />
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main className="flex-1 p-4 overflow-auto">{children}</main>
    </div>
  </div>
);

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
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  // Save last route on route change, except for auth-related pages
  useEffect(() => {
    const excludedPaths = [
      '/login',
      '/signup',
      '/verify-email',
      '/forgot-password',
      '/reset-password',
    ];

    const isExcluded = excludedPaths.some(path =>
      location.pathname.startsWith(path)
    );

    if (!isExcluded) {
      localStorage.setItem('lastRoute', location.pathname);
    }
  }, [location]);

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
