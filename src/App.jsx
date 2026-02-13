import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import MainApp from "./MainApp";
import Profile from "./Profile";
import Layout from "./Layout";
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
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES (No TopBar here) */}
        
        <Route
          path="/login"
          element={!isAuth ? <Login onLogin={handleLoginSuccess} /> : <Navigate to="/" />}
        />
        <Route path="/register" element={<Register onSuccess={() => {}} />} />

        {/* PROTECTED ROUTES (These WILL have the TopBar) */}
        {/* The Layout component wraps all routes inside it */}
        <Route element={isAuth ? <Layout user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}>
          
          {/* '/' renders MainApp inside the Layout */}
          <Route path="/" element={<MainApp user={user} />} />
          
          {/* '/profile' renders Profile inside the Layout */}
          <Route path="/profile" element={<Profile user={user} />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}