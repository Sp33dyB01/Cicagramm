import avatarImg from "./assets/avatar.png";
import catIcon from "./assets/icon-of-a-cat-face--transparent--simplified--insta.png";
import { authClient } from "./auth-client";
import { useNavigate } from "react-router-dom";
import { useRef, useState,useEffect } from 'react';
import './MainApp.css';
import type { SelectFelhasznalo } from '../worker/schema'
export default function TopBar( {user, onLogout}: {user: SelectFelhasznalo, onLogout: () => void}) {
  const [open, setOpen] = useState(false);
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
    navigate('/');
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
  return (
    <header className="header">
      <img
        src={catIcon}
        alt="logo"
        className="logo"
        onClick={handleLogoClick} // Make logo clickable and scroll to top
        style={{ cursor: 'pointer' }}
      />
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
            <div>Beállítások</div>
            <div onClick={logOut}>Kijelentkezés</div>
          </div>
        )}
      </div>
      ):
      (
        <h4 className="profile-wrapper" onClick={() => navigate("/login")}>Bejelentkezés/Regisztráció</h4>
      )}
    </header>
  );
}