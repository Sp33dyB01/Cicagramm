import avatarImg from "./assets/avatar.png";
import catIcon from "./assets/icon-of-a-cat-face--transparent--simplified--insta.png";
import { authClient } from "./auth-client";
import { useNavigate } from "react-router-dom";
import { useRef, useState } from 'react';
import './MainApp.css';
import type { SelectFelhasznalo } from '../worker/schema'
export default function TopBar( {user, onLogout}: {user: SelectFelhasznalo, onLogout: () => void}) {
  const [open, setOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const logOut = async () => {
    try {
    // 1. Wait for the server to log the user out
    await authClient.signOut(); 
    onLogout();
    // 2. Redirect to the login page
    navigate('/login') 
    
  } catch (error) {
    console.error("Hiba a kijelentkezéskor:", error);
  }
  };
  return (
    <header className="header">
      <img
        src={catIcon}
        alt="logo"
        className="logo"
        onClick={() => navigate("/")} // Make logo clickable!
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