import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Modal from "./Modal";
import React from "react";
import "./MainApp.css";
import { useToast } from "./Toast";
import CatProfile from "./CatProfile";
import avatarImg from "./assets/avatar.png"; // ÚJ: Kell a fallback képhez

// 10 rows per page * 5 items per row (based on your CSS grid) = 50 items per page
const ITEMS_PER_PAGE = 50; 

export default function MainApp({ user }) {
  const [selectedCat, setSelectedCat] = useState(null);
  const { showToast } = useToast();
  const profileRef = useRef(null);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("name");
  const [viewMode, setViewMode] = useState("grid");

  // Get initial page from URL, default to 1
  const [currentPage, setCurrentPage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get("page")) || 1;
  });

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

  // Sync state changes back to the URL (e.g., ?page=2) without full page reload
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    const url = new URL(window.location);
    url.searchParams.set("page", newPage);
    window.history.pushState({}, "", url);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Optional: scroll back to top on page change
  };

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

  // Calculate pagination
  const totalPages = Math.ceil(sortedCats.length / ITEMS_PER_PAGE);
  const paginatedCats = sortedCats.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) return <div>Betöltés...</div>;
  if (!cats || cats.length === 0) return <div>Nincsenek macskák.</div>;

  return (
    <div className="app">
      <div className="main-body">
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-header-left">
              {/* --- ÚJ: Nézetváltó gomb --- */}
              <button 
                className="view-toggle-btn"
                onClick={() => setViewMode(viewMode === "grid" ? "feed" : "grid")}
              >
                {viewMode === "grid" ? "📱 Hírfolyam nézet" : "🗂️ Rács nézet"}
              </button>
            </div>
            <div className="controls">
              <div className="sort-wrapper">
                <label htmlFor="sort" className="sort-label">Rendezés:</label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    handlePageChange(1); // Reset to first page on sort change
                  }}
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
        {viewMode === "grid" ? (
        <section className="cards-grid">
          {/* Map over paginatedCats instead of sortedCats */}
          {(paginatedCats || []).map((cat) => (
            <div className="tinder-card fixed-size" key={cat.cId} onClick={() => setSelectedCat(cat)}>
              <div className="card large">
                <img
                  src={`/api/images/${cat.pKep}`}
                  alt={cat.nev || "Cica kép"}
                />

                <button
                  className="overlay-like-btn"
                  onClick={(e) => { e.stopPropagation();  console.log('like', cat.cId); }}
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
        ) : (<section className="feed-container">
            {(paginatedCats || []).map((cat) => (
              <div className="feed-post" key={cat.cId}>
                {/* Poszt Fejléc */}
                <div className="post-header">
                  <img 
                    src={cat.owner?.pKep ? `/api/images/${cat.owner.pKep}` : avatarImg} 
                    alt="gazdi" 
                    className="post-avatar"
                    onError={(e) => { e.currentTarget.src = avatarImg; }}
                  />
                  <div className="post-header-info">
                    <span className="post-author">{cat.owner?.nev || "Ismeretlen Gazdi"}</span>
                    <span className="post-meta">
                      {cat.tavolsag || "? km"}
                    </span>
                  </div>
                </div>

                {/* Poszt Kép */}
                <div className="post-image-container">
                  <img src={`/api/images/${cat.pKep}`} alt={cat.nev} className="post-image" />
                </div>

                {/* Poszt Interakciók */}
                <div className="post-actions">
                  <button 
                    className="post-action-btn like-btn" 
                    onClick={() => console.log('like', cat.cId)}
                  >
                    ❤ Tetszik
                  </button>
                  <button 
                    className="post-action-btn" 
                    onClick={() => setSelectedCat(cat)}
                  >
                    💬 Részletek
                  </button>
                </div>

                {/* Poszt Leírás (Opcionális extra adatok) */}
                <div className="post-content">
                  <strong>{cat.nev}</strong> várja az álomgazdiját! Kattints a részletekért, ha megtetszett.
                </div>
              </div>
            ))}
          </section>
        )}
         {/* --- PAGINATION CONTROLS --- */}
         {totalPages > 1 && (
           <div className="pagination">
             <button 
               className="page-btn" 
               disabled={currentPage === 1} 
               onClick={() => handlePageChange(1)}
             >
               &laquo; Első
             </button>
             <button 
               className="page-btn" 
               disabled={currentPage === 1} 
               onClick={() => handlePageChange(currentPage - 1)}
             >
               &lsaquo; Előző
             </button>
             
             <span className="page-info">
               {currentPage} / {totalPages}
             </span>

             <button 
               className="page-btn" 
               disabled={currentPage === totalPages} 
               onClick={() => handlePageChange(currentPage + 1)}
             >
               Következő &rsaquo;
             </button>
             <button 
               className="page-btn" 
               disabled={currentPage === totalPages} 
               onClick={() => handlePageChange(totalPages)}
             >
               Utolsó &raquo;
             </button>
           </div>
         )}
       </div>
        {/* Így használjuk az újrafelhasználható Modalt */}
      <Modal 
        isOpen={!!selectedCat} 
        onClose={() => setSelectedCat(null)}
      >
        
        {/* Ha van kiválasztott macska, átadjuk az azonosítóját az új komponensnek */}
        {selectedCat && <CatProfile catId={selectedCat.cId} />}
      </Modal>
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