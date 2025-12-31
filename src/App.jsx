import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { CircularProgress, Box } from "@mui/material"; 
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

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function ProtectedRoute({ session, profileChecked, hasProfile, children }) {
  if (!session) return <Navigate to="/login" replace />;
  
  if (!profileChecked) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  } 
  if (!hasProfile) {
    return <Navigate to="/profile" replace />;
  }

  return children;
}

function App() {
  const [session, setSession] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);
  
  const verifyProfile = async (user) => {
    if (!user) return;
    if (user.email === 'guest@cabmate.com') {
        setHasProfile(true);
        setProfileChecked(true);
        return;
    }
    try {
      const res = await fetch(`${API_BASE}/profiles/${user.id}`);
      if (res.ok) {
        const profile = await res.json();
        setHasProfile(!!(profile?.full_name && profile?.phone));
      } else {
        setHasProfile(false);
      }
    } catch (err) {
      console.error("Profile Check Failed (Likely CORS or Network):", err);
      setHasProfile(false);
    } finally {
      setProfileChecked(true);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) verifyProfile(data.session.user);
      else setProfileChecked(true); 
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        verifyProfile(session.user);
      } else {
        setHasProfile(false);
        setProfileChecked(true);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <Background>
      <NotificationProvider>
        <BrowserRouter>
          <Header session={session} />
          <main style={{ position: "relative", zIndex: 1 }}>
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

function AppRoutes({ session, profileChecked, hasProfile, verifyProfile }) {
  return (
    <Routes>
      {/*Public Routes*/}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/update-password" element={<UpdatePasswordPage />} />

      {/*Profile Route-accessible to logged in users*/}
      <Route
        path="/profile"
        element={
          session ? (
            <ProfilePage 
              session={session}
              onProfileUpdate={() => verifyProfile(session.user)}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/*Protected Routes*/}
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