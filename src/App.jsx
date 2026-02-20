import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import MainApp from "./MainApp";
import Layout from "./Layout";
import Upload from "./Upload";
import Beallitasok from "./beallitasok";
import UserProfile from "./UserProfile";
import { ToastProvider } from "./Toast";
import { authClient } from "./auth-client";


export default function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const handleLogout = () => {
    setIsAuth(false);
    setUser(null);
  };
  const fetchUserProfile = async (userId, baseData) => {
    try {
      const profileRes = await fetch(`/api/profile/${userId}`);
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setUser({ ...baseData, ...profileData });
      } else {
        setUser(baseData);
      }
    } catch (profileError) {
      console.error("Hiba a profil betöltésekor:", profileError);
      setUser(baseData);
    }
  };

  useEffect(() => {
    async function checkSession() {
      try {
        const { data } = await authClient.getSession();
        if (data?.session) {
          await fetchUserProfile(data.user.id, data.user);
          setIsAuth(true);
        }
      } catch (error) {
        console.error("Hiba a session ellenőrzésekor:", error);
      } finally {
        setIsLoading(false);
      }
    }
    checkSession();
  }, []);

  const handleUpdateUser = () => {
    if (user?.id) {
      fetchUserProfile(user.id, user);
    }
  };

  const handleLoginSuccess = (userData) => {
    setIsAuth(true);
    setUser(userData);
  };

  if (isLoading) {
    return <div style={{ padding: 20 }}>Alkalmazás betöltése...</div>;
  }

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={!isAuth ?
            <Login onLogin={handleLoginSuccess} />
            : <Navigate to="/" />} />

          <Route path="/register" element={<Register onSuccess={handleLoginSuccess} />} />

          <Route element={<Layout user={user} onLogout={handleLogout} />}>

            <Route path="/" element={<MainApp user={user} />} />

            <Route path="/uploads" element={<Upload user={user} />} />

            <Route path="/beallitasok" element={<Beallitasok user={user} onUpdate={handleUpdateUser} />} />
            <Route path="/users/:userId" element={<UserProfile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}