import { useState, useEffect, useRef } from "react";
import React from "react";
import "./MainApp.css";
import { useToast } from "./Toast";

export default function MainApp({ user }) {
  const { showToast } = useToast();
  const profileRef = useRef(null);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("name");

  useEffect(() => {
    fetch("/api/cica")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched cats:", data);
        setCats(data);
        setLoading(false);
      })
      .catch((err) => {
        showToast("Hiba a macskák betöltésekor", "error");
        console.error("Hiba:", err);
        setLoading(false);
      });
  }, []);

  const sortedCats = [...cats].sort((a, b) => {
    if (sort === "name") {
      return (a.nev || "").localeCompare(b.nev || "");
    }
    if (sort === "age") {
      const ageA = a.kor || a.age || 0;
      const ageB = b.kor || b.age || 0;
      return ageA - ageB;
    }
    if (sort === "distance") {
      const distA = a.tavolsag || a.distance || 0;
      const distB = b.tavolsag || b.distance || 0;
      return distA - distB;
    }
    return 0;
  });

  if (loading) return <div>Betöltés...</div>;
  if (!cats || cats.length === 0) return <div>Nincsenek macskák.</div>;

  return (
    <div className="app">
      <div className="main-body">
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-header-left"></div>
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
        </aside>

        <section className="cards-grid">
          {(sortedCats || []).map((cat) => (
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

      {/* --- ÚJ FOOTER SZEKCIÓ --- */}
      <footer className="footer">
        <div className="footer-content">
          <h3>Cicagramm</h3>
          <p>Találd meg a tökéletes doromboló társat!</p>
          <p className="copyright">
            &copy; {new Date().getFullYear()} Cicagramm. Minden jog fenntartva.
          </p>
        </div>
      </footer>
    </div>
  );
}