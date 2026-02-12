import { useState, useEffect, useRef } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import "./MainApp.css";
import avatarImg from "./avatar.png";

export default function MainApp() {
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState(null); //egy poszt adatainek lekérése
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("name"); // új: rendezési állapot
  const profileRef = useRef(null);
  const navigate = useNavigate();

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

  // close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) return <div>Betöltés...</div>;
  if (!cat) return <div>A cica nem található.</div>;
  return (
    <div className="app">
      {/* TOP BAR */}
      <header className="header">
        <div className="logo">Cicagramm</div>

        {/* removed search from header - moved to sidebar controls */}

        <div className="profile-wrapper" ref={profileRef}>
          <img
            src={avatarImg}
            alt="profile"
            className="profile-pic"
            onClick={() => setOpen(!open)}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/40";
            }}
          />

          {open && (
            <div className="profile-dropdown">
              <div onClick={() => navigate("/profile")}>Profil</div>
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
          {/* ===== új: rendezés fejléce, jobb oldalra igazítva ===== */}
          <div className="sidebar-header">
            <div className="sidebar-header-left">{/* üres - space on left */}</div>

            {/* controls groups sort + filter together so they appear on the right */}
            <div className="controls">
              <div className="sort-wrapper">
                <label htmlFor="sort" className="sort-label">Rendezés:</label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="sort-select"
                >
                  <option value="name">Név</option>
                  <option value="age">Kor</option>
                  <option value="distance">Távolság</option>
                </select>
              </div>

              <div className="filter-wrapper">
                <input className="filter-input" placeholder="Speciális szűrés..." />
              </div>
            </div>
          </div>

          <div className="card large"></div>
          <div className="card small"></div>
        </aside>
      </div>
    
    {/*cat.images.map(img => (
        <img 
          key={img.mkepId} 
          src={`/api/images/${img.mkepId}`} 
          alt="Cica kép" 
          className="w-full rounded-lg"
        />
))*/}
    </div>
    
  );
}