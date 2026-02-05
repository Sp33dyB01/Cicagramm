import { useState, useEffect } from 'react';
import Login from './Login';
import Register from './Register'; // Assuming you have this
import CatManager from './test'; // The dashboard code from previous step
import { authClient } from "./auth-client";
function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('login'); // 'login' | 'register'
  const [isLoading, setIsLoading] = useState(true);

  // 1. Check if user is already logged in when app loads
  useEffect(() => {
    async function checkSession() {
      const { data } = await authClient.getSession();
      if (data?.session) {
        setUser(data.user);
      }
      setIsLoading(false);
    }
    checkSession();
  }, []);

  // 2. Handle Login Success
  const handleLoginSuccess = (userData) => {
    setUser(userData); // This triggers the switch to Dashboard
  };

  // 3. Handle Logout
  const handleLogout = async () => {
    await authClient.signOut();
    setUser(null);
    setCurrentView('login');
  };

  if (isLoading) return <div>Betöltés...</div>;

  // --- LOGIC: If user exists, show Dashboard. Else show Login/Register ---
  if (user) {
    return (
      <div>
        {/* Simple Navbar */}
        <nav style={{ padding: '1rem', background: '#eee', display: 'flex', justifyContent: 'space-between' }}>
          <span>Szia, {user.name || user.email}!</span>
          <button onClick={handleLogout}>Kijelentkezés</button>
        </nav>
        
        {/* THE MAIN APP */}
        <CatManager /> 
      </div>
    );
  }

  return (
    <div>
      {currentView === 'login' ? (
        <Login 
          onLogin={handleLoginSuccess} 
          onSwitch={() => setCurrentView('register')} 
        />
      ) : (
        <Register 
          onSwitch={() => setCurrentView('login')} 
        />
      )}
    </div>
  );
}

export default App;