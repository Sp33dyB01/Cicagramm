import { useState, useEffect, useRef } from "react";
import React from "react";
import "./MainApp.css";

export default function MainApp({user}) {
  const profileRef = useRef(null);
  const [cat, setCat] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("name");

  // A környezeti változó beolvasása a .env fájlból
  

  useEffect(() => {
    // ITT A LÉNYEG: A JSON adatokat is a Worker URL-jéről kérjük le!
    fetch(`$api/cica/cId/images/mKepId`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Workerből kapott adat:", data); // Ellenőrzésképp írasd ki!
        setCat(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Hiba:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Betöltés...</div>;
  if (!cat) return <div>A cica nem található.</div>;

  return (
    <div className="app">
      <div className="main-body">
        <aside className="sidebar">
          {/* ... a sidebar kódod változatlan marad ... */}
        </aside>
        
        <section className="cards-grid">
          {(cat.images || []).map((img) => (
            <div className="tinder-card fixed" key={img.mkepId}>
              <div className="card large">
                {/* ÚJ: A kép forrásának frissítése a Worker URL-lel */}
                <img 
                  src={`api/cica/cId/images/mkepId`} 
                  alt="Cica kép" 
                />
                
                <button
                  className="overlay-like-btn"
                  onClick={() => { console.log('like', img.mkepId); }}
                  title="Kedvencekhez"
                >
                  ❤
                </button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}