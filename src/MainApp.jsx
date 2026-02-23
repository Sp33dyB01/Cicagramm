import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import Modal from "./Modal";
import React from "react";
import "./MainApp.css";
import { useToast } from "./Toast";
import CatProfile from "./CatProfile";
import avatarImg from "./assets/avatar.png"; // ÚJ: Kell a fallback képhez
import { getDistance } from "/worker/tavolsag";

export default function MainApp({ user, ipLat, ipLon }) {
  const [selectedCat, setSelectedCat] = useState(null);
  const { showToast } = useToast();
  const profileRef = useRef(null);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("sort") || "name";
  });
  const [viewMode, setViewMode] = useState("grid");
  //const [userCoords, setUserCoords] = useState(null);

  // Get initial page from URL, default to 1
  const [currentPage, setCurrentPage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get("page")) || 1;
  });

  /*useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // A getDistance függvény Coordinates objektumot (lat, lon) vár
          setUserCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            displayName: "Saját helyzet" 
          });
        },
        (error) => {
          console.warn("Helymeghatározás megtagadva vagy sikertelen:", error);
        }
      );
    }
  }, []);*/

  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    let apiSort = "1N";
    if (sort === "name") apiSort = "1N";
    if (sort === "age") apiSort = "3N";
    if (sort === "distance") apiSort = "2N";

    const fetchUrl = new URL(window.location.origin + "/api/cica");
    fetchUrl.searchParams.set("page", currentPage);
    fetchUrl.searchParams.set("sort", apiSort);
    // TODO: handle filter inputs once implemented.

    if (user) {
      if (user.lat && user.lon) {
        fetchUrl.searchParams.set("lat", user.lat);
        fetchUrl.searchParams.set("lon", user.lon);
      }
    } else if (ipLat && ipLon) {
      fetchUrl.searchParams.set("lat", ipLat);
      fetchUrl.searchParams.set("lon", ipLon);
    }

    fetch(fetchUrl.toString())
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched cats:", data);
        if (data.data) {
          setCats(data.data);
          setTotalPages(data.totalPages || 1);
        } else {
          // Fallback if data isn't in { data, totalPages } format yet
          setCats(Array.isArray(data) ? data : []);
          setTotalPages(1);
        }
        setLoading(false);
      })
      .catch((err) => {
        showToast("Hiba a macskák betöltésekor", "error");
        console.error("Hiba:", err);
        setLoading(false);
      });
  }, [currentPage, sort, user, ipLat, ipLon]);

  const catsWithDistance = useMemo(() => {
    return cats.map(cat => {
      // Feltételezve, hogy az adatbázisból (vagy a cat objektumból) jön a cica/gazda koordinátája.
      // Ezt igazítsd a pontos JSON struktúrádhoz! (pl. cat.owner.lat)
      const catLat = parseFloat(cat.ownerLat || cat.lat || (cat.owner && cat.owner.lat));
      const catLon = parseFloat(cat.ownerLon || cat.lon || (cat.owner && cat.owner.lon));

      let dist = null;
      const catCoords = { lat: catLat, lon: catLon, displayName: cat.ownerCity };
      if (user) {
        const userCoords = { lat: user.lat, lon: user.lon, displayName: user.varos };
        dist = getDistance(userCoords, catCoords); // Hívjuk a te tavolsag.ts-ben lévő függvényedet
      }
      else {
        const userCoords = { lat: ipLat, lon: ipLon, displayName: "" };
        dist = getDistance(userCoords, catCoords);
      }
      return {
        ...cat,
        // A kiszámolt távolságot le is kerekíthetjük 1 tizedesjegyre
        calculatedDistance: dist !== null ? Math.round(dist * 10) / 10 : null
      };
    });
  }, [cats]);


  // 4. Mivel a rendezés és a lapozás is a szerveren történik,
  // itt csak a kiegészített (távolsággal rendelkező) macskákat adjuk tovább.
  const paginatedCats = catsWithDistance;

  // Sync state changes back to the URL (e.g., ?page=2) without full page reload
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    const url = new URL(window.location);
    url.searchParams.set("page", newPage);
    window.history.pushState({}, "", url);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Optional: scroll back to top on page change
  };

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
                    const newSort = e.target.value;
                    setSort(newSort);
                    setCurrentPage(1);
                    const url = new URL(window.location);
                    url.searchParams.set("sort", newSort);
                    url.searchParams.set("page", 1);
                    window.history.pushState({}, "", url);
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
                    onClick={(e) => { e.stopPropagation(); console.log('like', cat.cId); }}
                    title="Kedvencekhez"
                  >
                    ❤
                  </button>

                  <div className="card small">
                    <span className="cat-info cat-name">{cat.nev || "Ismeretlen"}</span>

                    <span className="cat-info cat-age">{cat.kor || cat.age || "? év"}</span>
                    <span className="cat-info cat-distance">
                      {cat.calculatedDistance !== null ? `${cat.calculatedDistance} km` : "? km"}
                    </span>
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
                  src={cat?.ownerPFP ? `/api/images/${cat.ownerPFP}` : avatarImg}
                  alt="gazdi"
                  className="post-avatar"
                  onError={(e) => { e.currentTarget.src = avatarImg; }}
                />
                <div className="post-header-info">
                  <span className="post-author">{cat.ownerNev || "Ismeretlen Gazdi"}</span>
                  <span className="post-meta">
                    {cat.kor || "? év"} • {cat.calculatedDistance !== null ? `${cat.calculatedDistance} km-re` : "Távolság ismeretlen"}
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