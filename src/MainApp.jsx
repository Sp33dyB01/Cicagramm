import { useState, useEffect, useRef } from "react";
import React from "react";
import "./MainApp.css";


export default function MainApp({user}) {
  const profileRef = useRef(null);
  const [cat, setCat] = useState(null); //egy poszt adatainek lekérése
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("name"); // új: rendezési állapot

  useEffect(() => {
    fetch("/api/cica")
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

          {/* sidebar body can hold other controls or lists */}
        </aside>
        
        {/* cards grid: render one fixed-size tinder card per uploaded image */}
        <section className="cards-grid">
  {(cat.images || []).map((img) => (
    <div className="tinder-card fixed" key={img.mkepId}>
      
      {/* A kép konténere lesz a referenciapont (relative) */}
      <div className="card large">
        <img src={`/api/images/${img.mkepId}`} alt="Cica kép" />
        
        {/* ÚJ: A szív gomb itt van a képen belül */}
        <button
          className="overlay-like-btn"
          onClick={() => { console.log('like', img.mkepId); }}
          title="Kedvencekhez"
        >
          ❤
        </button>
      </div>

      {/* A card.small-t akár törölheted is, ha nem kell más adat, 
          vagy megtarthatod, ha mást írnál oda (pl. név) */}
    </div>
  ))}
</section>
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