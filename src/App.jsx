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
  useEffect(() => {
    async function checkSession() {
      try {
        const { data } = await authClient.getSession();
        if (data?.session) {
          setUser(data.user);
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

            <Route path="/beallitasok" element={<Beallitasok user={user} />} />
            <Route path="/users/:userId" element={<UserProfile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}