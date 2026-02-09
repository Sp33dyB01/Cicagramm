
import { useState, useEffect } from 'react';
import Login from './Login';
import Register from './Register'; 
import CatManager from './test'; // Your Cat Manager
import UserManager from './testuser'; // <--- Import the new User Manager here
import { authClient } from "./auth-client";

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('login'); 
  const [isLoading, setIsLoading] = useState(true);
  
  // New State for Tabs: 'cats' or 'users'
  const [activeTab, setActiveTab] = useState('cats'); 

  // 1. Check Session
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

  // 2. Login Success
  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  // 3. Logout
  const handleLogout = async () => {
    await authClient.signOut();
    setUser(null);
    setCurrentView('login');
    setActiveTab('cats'); // Reset tab on logout
  };

  if (isLoading) return <div style={{padding: '2rem', textAlign: 'center'}}>Betöltés...</div>;

  // --- LOGGED IN VIEW ---
  if (user) {
    return (
      <div>
        {/* Navbar */}
        <nav style={{ 
          padding: '1rem', 
          background: '#333', 
          color: 'white',
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Cicagramm Admin</span>
            
            {/* TAB BUTTONS */}
            <div style={{ display: 'flex', gap: '5px' }}>
              <button 
                onClick={() => setActiveTab('cats')}
                style={{
                  padding: '8px 16px',
                  background: activeTab === 'cats' ? '#007bff' : '#555',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                🐱 Cicák
              </button>
              
              <button 
                onClick={() => setActiveTab('users')}
                style={{
                  padding: '8px 16px',
                  background: activeTab === 'users' ? '#007bff' : '#555',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                👤 Felhasználók
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: '#ccc' }}>
              {user.name || user.email}
            </span>
            <button 
              onClick={handleLogout}
              style={{ padding: '5px 10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Kilépés
            </button>
          </div>
        </nav>
        
        {/* MAIN CONTENT AREA */}
        <main style={{ padding: '20px' }}>
          {activeTab === 'cats' ? (
            <CatManager />
          ) : (
            <UserManager />
          )}
        </main>
      </div>
    );
  }

  // --- LOGGED OUT VIEW ---
  return (
    <div>
      {currentView === 'login' ? (
        <Login 
          onLogin={handleLoginSuccess} 
          onSwitch={() => setCurrentView('register')} 
        />
      ) : (
        <Register 
          onSuccess={() => { alert("Sikeres regisztráció!"); setCurrentView('login'); }}
          onSwitch={() => setCurrentView('login')} 
        />
      )}
    </div>
  );
}

export default App;