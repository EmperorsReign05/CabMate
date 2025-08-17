import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import CreateRidePage from './pages/CreateRidePage';
import RideDetailPage from './pages/RideDetailPage';
import MyRidesPage from './pages/MyRidesPage';

function App() {
  // --- THIS IS THE MISSING LOGIC ---
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
  // --- END OF MISSING LOGIC ---

  return (
    <BrowserRouter>
      {/* Pass the session to all components that need it */}
      <Header session={session} />
      <main style={{ padding: '1rem' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create" element={<CreateRidePage session={session} />} />
          <Route path="/ride/:id" element={<RideDetailPage session={session} />} />
          <Route path="/my-rides" element={<MyRidesPage session={session} />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;