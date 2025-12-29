import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import CreateRidePage from './pages/CreateRidePage';
import RideDetailPage from './pages/RideDetailPage';
import MyRidesPage from './pages/MyRidesPage';
import { NotificationProvider } from './context/NotificationContext';
import ProfilePage from './pages/ProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import DashboardPage from './pages/DashboardPage'; 
import Background from './components/Background';
import LocalCabsPage from './pages/LocalCabsPage';
function App() {
  const API_BASE = "http://127.0.0.1:8000";

  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => {
  if (!session?.user) return;

  const user = session.user;

  fetch(`${API_BASE}/profiles/${user.id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      full_name: user.user_metadata?.full_name || "User",
      phone: user.user_metadata?.phone || null,
      email: user.email,
    }),
  }).catch(() => {
    // silent fail — do not block UI
  });
}, [session]);


  return (
      <Background>
  <NotificationProvider>
    <BrowserRouter>
     
      <Header session={session} />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage session={session} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create" element={<CreateRidePage session={session} />} />
          <Route path="/ride/:id" element={<RideDetailPage session={session} />} />
          <Route path="/local-cabs" element={<LocalCabsPage />} /> 
          <Route path="/my-rides" element={<MyRidesPage session={session} />} />
           <Route path="/profile" element={<ProfilePage session={session} />} />
           <Route path="/forgot-password" element={<ForgotPasswordPage />} />
           <Route path="/update-password" element={<UpdatePasswordPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  </NotificationProvider>
  </Background>
  );
}

export default App;