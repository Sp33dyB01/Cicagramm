//import { useState, useEffect } from "react";
import React, { useState } from "react";
import "./MainApp.css";
import avatarImg from "./avatar.png";

export default function MainApp() {
  const [open, setOpen] = useState(false);
   /*const [cat, setCat] = useState(null); egy poszt adatainek lekérése
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cica/123test")
      .then((res) => res.json())
      .then((data) => {
        setCat(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Hiba:", err);
        setLoading(false);
      });
  }, []);
  if (loading) return <div>Betöltés...</div>;
  if (!cat) return <div>A cica nem található.</div>;*/
  return (
    <div className="app">
      {/* TOP BAR */}
      <header className="header">
        <div className="logo">Cicagramm</div>

        <div className="search">
          <input placeholder="Advanced filter..." />
        </div>

        <div className="profile-wrapper">
          <img
            src={avatarImg}
            alt="profile"
            className="profile-pic"
            onClick={() => setOpen(!open)}
            onError={e => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/40"; }}
          />

          {open && (
            <div className="profile-dropdown">
              <div>Profil</div>
              <div>Beállítások</div>
              <div>Kijelentkezés</div>
            </div>
          )}
        </div>
      </header>

      {/* BODY */}
      <div className="main-body">
        {/* LEFT SIDEBAR */}
        <aside className="sidebar">
          <div className="card large"></div>
          <div className="card small"></div>
        </aside>
      </div>
    </div>
  );
}
