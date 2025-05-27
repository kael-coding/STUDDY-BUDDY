import React, { useEffect, useState } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages & Components
import SignupPage from './pages/auth/signupPage.jsx';
import LoginPage from './pages/auth/loginPage.jsx';
import HomePage from './pages/mainPages/dashboard.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';
import VerificationCode from './pages/code/verifyCode.jsx';
import ArchiveMainContent from './pages/quickAccess/ArchiveMainContent.jsx';
import SuperAdminDashboard from './admin/SuperAdminDashboard.jsx';
import Profile from './pages/profilePicture/profile.jsx';
import IntroPage from './pages/index.jsx';
import TaskScheduler from './pages/mainPages/TaskScheduler.jsx';
import DigitalNotebook from './pages/mainPages/DigitalNotebook.jsx';
import Community from './pages/mainPages/Community.jsx';
import Messages from './pages/mainPages/Messages.jsx';
import Notification from './pages/mainPages/notification.jsx';
import Navbar from './components/header/Navbar.jsx';
import LoadingSpinner from './components/loadingSpinner.jsx';
import Sidebar from './components/navigation/sidebar.jsx';
import Setting from "./pages/setting/ProfileSection.jsx";
import Security from "./pages/setting/SecuritySection.jsx";
import NotFound from './pages/404/NotFound.jsx';
import { useAuthStore } from './store/authStore.js';

// ProtectedRoute and RedirectAuthenticatedUser remain unchanged
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

const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    if (user.role === "superadmin") {
      return <Navigate to="/super-admin-dashboard" replace />;
    }
    if (user.isVerified) {
      return <Navigate to="/user_dashboard" replace />;
    }
  }

  return children;
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize(); // initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

const MainLayout = ({ children }) => {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Hide Navbar if path is /setting
  const hideNavbar = location.pathname === "/setting/user/profileg";

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-[#f4f7f5] text-[#3e4c45]">
        {!hideNavbar && <Navbar onToggleSidebar={toggleSidebar} />}
        <div className="flex flex-1 overflow-hidden">
          <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
          <main className="flex-1 p-4 overflow-auto">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f4f7f5] text-[#3e4c45]">
      <Sidebar isOpen={true} onClose={closeSidebar} /> {/* always open */}
      <div className="flex flex-1 flex-col p-3">
        {!hideNavbar && <Navbar onToggleSidebar={toggleSidebar} />}
        <main className="flex-1 p-4 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

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
        <Messages />
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
    path: '/profile',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <Profile />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/super-admin-dashboard',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <SuperAdminDashboard />
        </MainLayout>
      </ProtectedRoute>
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
  {
    path: '/notifications',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <Notification />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/setting/user/profile',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <Setting />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/setting/user/security',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <Security />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: (
      <NotFound />
    ),
  },
];

function App() {
  const { checkAuth, isCheckingAuth } = useAuthStore();

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
