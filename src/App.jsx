import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import MainApp from "./MainApp";
import Profile from "./profile";
import { authClient } from "./auth-client";
// FONTOS: Ne felejtsd el importálni az authClient-et!
// import { authClient } from "./valahol"; 

export default function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState(null);

  // 1. HIBA JAVÍTVA: Létrehozzuk a loading state-et
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        // Feltételezzük, hogy ez a függvényed működik
        const { data } = await authClient.getSession();

        if (data?.session) {
          setUser(data.user);
          // 2. HIBA JAVÍTVA: Ha van session, beállítjuk az auth-ot is!
          setIsAuth(true);
        }
      } catch (error) {
        console.error("Hiba a session ellenőrzésekor:", error);
      } finally {
        // Akár sikerült, akár nem, a töltést befejezzük
        setIsLoading(false);
      }
    }
    checkSession();
  }, []);

  // Login segédfüggvény (hogy a Login komponens be tudja állítani az állapotot)
  const handleLoginSuccess = (userData) => {
    setIsAuth(true);
    setUser(userData);
  };

  // 3. HIBA JAVÍTVA: Amíg töltünk, nem engedjük a Routert futni
  if (isLoading) {
    return <div style={{ padding: 20 }}>Alkalmazás betöltése...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN: Ha már be vagy lépve, irány a főoldal, ha nem, akkor Login */}
        <Route
          path="/login"
          element={!isAuth ? <Login onLogin={handleLoginSuccess} user={user} /> : <Navigate to="/" />}
        />

        {/* FŐOLDAL: Védett útvonal */}
        <Route
          path="/"
          element={isAuth ? <MainApp user={user} /> : <Navigate to="/login" />}
        />

        {/* PROFIL: Védett útvonal */}
        <Route
          path="/profile"
          element={isAuth ? <Profile user={user} /> : <Navigate to="/login" />}
        />

        {/* REGISZTRÁCIÓ */}
        <Route path="/register" element={<Register onSuccess={() => { }} />} />
      </Routes>
    </BrowserRouter>
  );
}
