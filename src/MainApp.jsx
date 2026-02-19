import { useState, useEffect, useRef } from "react";
import React from "react";
import "./MainApp.css";

export default function MainApp({user}) {
  const profileRef = useRef(null);
  const [cats, setCats] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("name");

// A környezeti változó beolvasása a .env fájlból
  

  useEffect(() => {
    // ITT A LÉNYEG: A JSON adatokat is a Worker URL-jéről kérjük le!
    fetch("/api/cica")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched cats:", data);
        setCats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Hiba:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Betöltés...</div>;
  if (!cats || cats.length === 0) return <div>Nincsenek macskák.</div>;

  return (
    <div className="app">
      <div className="main-body">
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
          {/* ... a sidebar kódod változatlan marad ... */}
        </aside>
        
        <section className="cards-grid">
          {(cats || []).map((cat) => (
            <div className="tinder-card fixed-size" key={cat.cId}>
              <div className="card large">
                <img 
                  src={`/api/images/${cat.pKep}`} 
                  alt={cat.nev || "Cica kép"} 
                />

                <button
                  className="overlay-like-btn"
                  onClick={() => { console.log('like', cat.cId); }}
                  title="Kedvencekhez"
                >
                  ❤
                </button>

                {/* --- NEW: Repurposed card small for image text overlays --- */}
                <div className="card small">
                  <span className="cat-info cat-name">{cat.nev || "Ismeretlen"}</span>
                  <span className="cat-info cat-age">{cat.kor || cat.age || "? év"}</span>
                  <span className="cat-info cat-distance">{cat.tavolsag || cat.distance || "? km"}</span>
                </div>
                
              </div>
            </div>
          ))}
         </section>
       </div>
     </div>
   );
 }