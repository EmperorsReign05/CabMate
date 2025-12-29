import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { supabase } from "./supabaseClient";

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

/* ---------------- PROTECTED ROUTE ---------------- */

function ProtectedRoute({ session, profileChecked, hasProfile, children }) {
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (profileChecked && !hasProfile) {
    return <Navigate to="/profile" replace />;
  }

  return children;
}

/* ---------------- APP ---------------- */

function App() {
  const [session, setSession] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);

  /* --- AUTH SESSION --- */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  /* --- PROFILE CHECK --- */
  useEffect(() => {
    if (!session?.user) {
      setProfileChecked(true);
      setHasProfile(false);
      return;
    }

    const checkProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/profiles/${session.user.id}`);

        if (res.ok) {
          const profile = await res.json();
          setHasProfile(!!profile?.full_name);
        } else {
          setHasProfile(false);
        }
      } catch {
        setHasProfile(false);
      } finally {
        setProfileChecked(true);
      }
    };

    checkProfile();
  }, [session]);

  return (
    <Background>
      <NotificationProvider>
        <BrowserRouter>
          <Header session={session} />

          <main style={{ position: "relative", zIndex: 1 }}>
            <Routes>
              {/* PUBLIC */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/update-password" element={<UpdatePasswordPage />} />

              {/* PROFILE (must be logged in) */}
              <Route
                path="/profile"
                element={
                  session ? (
                    <ProfilePage session={session} />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              {/* PROTECTED */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute
                    session={session}
                    profileChecked={profileChecked}
                    hasProfile={hasProfile}
                  >
                    <DashboardPage session={session} />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/create"
                element={
                  <ProtectedRoute
                    session={session}
                    profileChecked={profileChecked}
                    hasProfile={hasProfile}
                  >
                    <CreateRidePage session={session} />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/ride/:id"
                element={
                  <ProtectedRoute
                    session={session}
                    profileChecked={profileChecked}
                    hasProfile={hasProfile}
                  >
                    <RideDetailPage session={session} />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/my-rides"
                element={
                  <ProtectedRoute
                    session={session}
                    profileChecked={profileChecked}
                    hasProfile={hasProfile}
                  >
                    <MyRidesPage session={session} />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/local-cabs"
                element={
                  <ProtectedRoute
                    session={session}
                    profileChecked={profileChecked}
                    hasProfile={hasProfile}
                  >
                    <LocalCabsPage />
                  </ProtectedRoute>
                }
              />

              {/* FALLBACK */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </BrowserRouter>
      </NotificationProvider>
    </Background>
  );
}

export default App;
