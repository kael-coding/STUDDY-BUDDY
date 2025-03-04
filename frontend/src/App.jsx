import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'

import SignupPage from './pages/auth/signupPage.jsx'
import LoginPage from './pages/auth/loginPage.jsx'
import HomePage from './pages/home/homePage.jsx'
import ForgotPassword from './pages/auth/ForgotPassword.jsx'
import ResetPassword from './pages/auth/ResetPassword.jsx'
import VerificationCode from './pages/code/verifyCode.jsx'
import IntroPage from './pages/index.jsx'
import LoadingSpinner from './components/loadingSpinner.jsx'

import { useAuthStore } from './store/authStore.js'
import { useEffect } from 'react'



const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  if (!user.isVerified) {
    return <Navigate to='/verify-email' replace />;
  }

  return children;
};

const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore()

  if (isAuthenticated && user.isVerified) {
    return <Navigate to="/home" replace />
  }
  return children
}

function App() {
  const { isCheckingAuth, checkAuth, } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }
    , [checkAuth])
  if (isCheckingAuth) return <LoadingSpinner />;


  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={
          <IntroPage />
        } />

        <Route path="/home" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>} />

        <Route path="/signup" element={
          <RedirectAuthenticatedUser>
            <SignupPage />
          </RedirectAuthenticatedUser>} />

        <Route path="/login" element={
          <RedirectAuthenticatedUser>
            <LoginPage />
          </RedirectAuthenticatedUser>
        } />



        <Route path="/verify-email" element={
          <RedirectAuthenticatedUser>
            <VerificationCode />
          </RedirectAuthenticatedUser>} />

        <Route path="/forgot-password" element={
          <RedirectAuthenticatedUser>
            <ForgotPassword />
          </RedirectAuthenticatedUser>
        } />

        <Route path="/reset-password" element={<ResetPassword />} />


      </Routes>
    </div>
  )
}

export default App
