import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Login from "./Login";
import Register from "./Register";
import MainApp from "./MainApp";
import Layout from "./Layout";
import Upload from "./Upload";
import Beallitasok from "./beallitasok";
import UserProfile from "./UserProfile";
import Admin from "./Admin";
import NotFound from "./NotFound";
import { ToastProvider } from "./Toast";
import { authClient } from "./auth-client";


export default function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  const handleLogout = () => {
    setIsAuth(false);
    setUser(null);
    queryClient.setQueryData(['session'], null);
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

  const { isLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await authClient.getSession();
      if (data?.session) {
        await fetchUserProfile(data.user.id, data.user);
        setIsAuth(true);
        return data; // Return session data
      }
      return null;
    },
    staleTime: Infinity,
  });

  const handleUpdateUser = () => {
    if (user?.id) {
      fetchUserProfile(user.id, user); // Update local state directly instead of query to match exact previous behavior
      queryClient.invalidateQueries(['userProfile', user.id]); // Just in case
    }
  };

  const handleLoginSuccess = (userData) => {
    setIsAuth(true);
    setUser(userData);
    queryClient.invalidateQueries(['session']);
  };

  const { data: ipCoords = null } = useQuery({
    queryKey: ['ipInfo'],
    queryFn: async () => {
      const response = await fetch('api/ipinfo')
      const data = await response.json();
      if (data && !data.error) {
        console.log(`Vendég elhelyezkedése: ${data.city}, ${data.lat}° ${data.lon}°`)
        return { lat: data.lat, lon: data.lon, displayName: data.city };
      }
      return null;
    },
    staleTime: Infinity,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
        <div className="text-xl font-bold animate-pulse">Alkalmazás betöltése...</div>
      </div>
    );
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

            <Route path="/" element={<MainApp user={user} ipCoords={ipCoords} />} />

            <Route path="/uploads" element={<Upload user={user} />} />

            <Route path="/beallitasok" element={<Beallitasok user={user} onUpdate={handleUpdateUser} />} />
            <Route path="/users/:userId" element={<UserProfile />} />
            <Route path="/admin" element={user?.admin ? <Admin /> : <Navigate to="/" />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}