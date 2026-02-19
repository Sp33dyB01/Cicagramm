import avatarImg from "./assets/avatar.png";
import catIcon from "./assets/icon-of-a-cat-face--transparent--simplified--insta.png";
import { authClient } from "./auth-client";
import { useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from 'react';
import './MainApp.css';
import type { SelectFelhasznalo } from '../worker/schema'
export default function TopBar({ user, onLogout }: { user: SelectFelhasznalo, onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(false); // New Theme State
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const handleLogoClick = () => {
    navigate('/');
    // ensure the page scrolls back to top when the logo is clicked
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const logOut = async () => {
    try {
      await authClient.signOut();
      onLogout();
      window.location.reload();
    } catch (error) {
      console.error("Hiba a kijelentkezéskor:", error);
    }
  };
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [showHeader, setShowHeader] = useState(true);
const [lastScrollY, setLastScrollY] = useState(0);

useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      setIsDark(true);
    }
  }, []);
  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

useEffect(() => {
  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    
    // If scrolling down AND past the header height (70px), hide it
    if (currentScrollY > lastScrollY && currentScrollY > 70) {
      setShowHeader(false);
    } else {
      // If scrolling up, show it
      setShowHeader(true);
    }
    
    setLastScrollY(currentScrollY);
  };

// Initialize theme from system preference or localStorage
  


  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}, [lastScrollY]);

  return (
    <header className={`header ${!showHeader ? "header-hidden" : ""}`}>
      <img
        src={catIcon}
        alt="logo"
        className="logo"
        onClick={handleLogoClick}
        style={{ cursor: 'pointer' }}
      />
      
      {/* Spacer to push controls to the right */}
      <div style={{ flex: 1 }}></div>

      <div className="controls-right" style={{ display: 'flex', alignItems: 'center' }}>
        
        {/* THE DARK MODE TOGGLE */}
        <button className="theme-toggle" onClick={toggleTheme} title="Téma váltása">
          {isDark ? "🌙" : "☀️"}
        </button>

        {user ? (
          <div className="profile-wrapper" ref={profileRef}>
            <img
              src={`/api/images/${user.pKep}`}
              alt="profile"
              className="profile-pic"
              onClick={() => setOpen(!open)}
              onError={(e) => {
                e.currentTarget.src = avatarImg;
                e.currentTarget.onerror = null;
              }}
              style={{ cursor: 'pointer' }}
            />
            {open && (
            <div className="profile-dropdown">
              <div onClick={() => { setOpen(false); navigate("/profile"); }}>Profil</div>
              <div onClick={() => { setOpen(false); navigate("/beallitasok"); }}>Beállítások</div>
              <div onClick={() => { setOpen(false); navigate("/uploads") }}>Feltöltés</div>
              <div onClick={logOut}>Kijelentkezés</div>
            </div>
          )}
          </div>
        ) : (
          <h4 className="profile-wrapper" onClick={() => navigate("/login")}>
            Bejelentkezés/Regisztráció
          </h4>
        )}
      </div>
    </header>
  );
}
