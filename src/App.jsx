import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { CircularProgress } from "@mui/material";
import Header from "./components/Header";
import Background from "./components/Background";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CreateRidePage from "./pages/CreateRidePage";
import RideDetailPage from "./pages/RideDetailPage";
import MyRidesPage from "./pages/MyRidesPage";
import ProfilePage from "./pages/ProfilePage";
import LocalCabsPage from "./pages/LocalCabsPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import UpdatePasswordPage from "./pages/UpdatePasswordPage";

import { NotificationProvider } from "./context/NotificationContext";

const API_BASE = "http://127.0.0.1:8000";

// src/App.jsx - Improved ProtectedRoute
function ProtectedRoute({ session, profileChecked, hasProfile, children }) {
  if (!session) return <Navigate to="/login" replace />;
  
  if (!profileChecked) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
        <CircularProgress /> 
      </div>
    );
  } 

  if (!hasProfile) {
    return <Navigate to="/profile" replace />;
  }

  return children;
}

/* ---------------- APP ---------------- */

function App() {
  const [session, setSession] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);
  
  const verifyProfile = async (user) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/profiles/${user.id}`);
      if (res.ok) {
        const profile = await res.json();
        setHasProfile(!!(profile?.full_name && profile?.phone));
      } else {
        setHasProfile(false);
      }
    } catch (err) {
      setHasProfile(false);
    } finally {
      setProfileChecked(true);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) verifyProfile(data.session.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        verifyProfile(session.user);
      } else {
        setHasProfile(false);
        setProfileChecked(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Removed redundant useEffect that was causing double checks

  return (
    <Background>
      <NotificationProvider>
        <BrowserRouter>
          <Header session={session} />
          <main style={{ position: "relative", zIndex: 1 }}>
            {/* PASS verifyProfile HERE */}
            <AppRoutes 
              session={session} 
              profileChecked={profileChecked} 
              hasProfile={hasProfile} 
              verifyProfile={verifyProfile} 
            />
          </main>
        </BrowserRouter>
      </NotificationProvider>
    </Background>
  );
}

// RECEIVE verifyProfile HERE
function AppRoutes({ session, profileChecked, hasProfile, verifyProfile }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!profileChecked) return;
    if (!session) return;
    if (hasProfile) return;
    
    const currentPath = location.pathname;
    if (currentPath === '/profile' || 
        currentPath === '/login' || 
        currentPath === '/forgot-password' || 
        currentPath === '/update-password') {
      return;
    }
    
    navigate('/profile', { replace: true });
  }, [session, profileChecked, hasProfile, location.pathname, navigate]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/update-password" element={<UpdatePasswordPage />} />

      {/* PROFILE */}
      <Route
        path="/profile"
        element={
          session ? (
            <ProfilePage 
              session={session}
              onProfileUpdate={() => verifyProfile(session.user)} // Now this works!
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* PROTECTED */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute session={session} profileChecked={profileChecked} hasProfile={hasProfile}>
            <DashboardPage session={session} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create"
        element={
          <ProtectedRoute session={session} profileChecked={profileChecked} hasProfile={hasProfile}>
            <CreateRidePage session={session} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ride/:id"
        element={
          <ProtectedRoute session={session} profileChecked={profileChecked} hasProfile={hasProfile}>
            <RideDetailPage session={session} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-rides"
        element={
          <ProtectedRoute session={session} profileChecked={profileChecked} hasProfile={hasProfile}>
            <MyRidesPage session={session} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/local-cabs"
        element={
          <ProtectedRoute session={session} profileChecked={profileChecked} hasProfile={hasProfile}>
            <LocalCabsPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;