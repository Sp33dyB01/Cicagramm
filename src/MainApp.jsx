import { useState, useRef } from "react";
import Modal from "./Modal";
import "./MainApp.css";
import { useToast } from "./Toast";
import CatProfile from "./CatProfile";
import avatarImg from "./assets/avatar.png"; // ÚJ: Kell a fallback képhez
import { useFajtak } from "./hooks/useFajtak";
import { usePagination } from "./hooks/usePagination";
import { useFilters } from "./hooks/useFilters";
import { useCats } from "./hooks/useCats";
import { useLike } from "./hooks/useLike";

export default function MainApp({ user, ipCoords }) {
  const [selectedCat, setSelectedCat] = useState(null);
  const { showToast } = useToast();
  const profileRef = useRef(null);
  const fajtak = useFajtak();
  const { currentPage, setCurrentPage, handlePageChange } = usePagination();
  const { isFilterOpen, setIsFilterOpen, filters, appliedFilters, handleApplyFilters, handleFilterChange, kivalasztottFajtak, fajtaValtozasKezelese, kivalasztottaSzinek, szinValtozasKezelese, kivalasztasTorlese } = useFilters(setCurrentPage);

  const [sort, setSort] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("sort") || "name";
  });
  const [layout, setLayout] = useState("grid");

  const { catsWithDistance: paginatedCats, setCats, loading, totalPages } = useCats({
    currentPage,
    sort,
    user,
    ipCoords,
    appliedFilters,
    showToast
  });

  const { handleAction } = useLike();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-5">
        <div className="paw-print-loader">
          <div className="paw paw-1">🐾</div>
          <div className="paw paw-2">🐾</div>
          <div className="paw paw-3">🐾</div>
        </div>
        <p className="text-lg font-bold text-neutral-600 dark:text-neutral-400">Cicák cserkészése...</p>
      </div>
    );
  }
  if (!paginatedCats || paginatedCats.length === 0) return <div>Nincsenek macskák.</div>;

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 transition-colors">
      <div className="flex flex-col md:flex-row flex-1 w-full max-w-7xl mx-auto pt-[70px]">
        {/* Sidebar */}
        <aside className="w-full md:w-64 p-5 flex flex-col gap-5 flex-shrink-0 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700">
          <div className="flex flex-col w-full">

            {/* Top Controls */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center w-full">
                <button
                  className="px-3 py-1.5 border-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 rounded text-sm font-bold shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-600 transition-colors"
                  onClick={() => setLayout(layout === "grid" ? "feed" : "grid")}
                >
                  {layout === "grid" ? "📱 Hírfolyam" : "🗂️ Rács"}
                </button>
                <div className="flex items-center gap-2">
                  <select
                    id="sort"
                    value={sort}
                    onChange={(e) => {
                      const newSort = e.target.value;
                      setSort(newSort);
                      setCurrentPage(1);
                    }}
                    className="h-9 px-2 border-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 rounded text-sm cursor-pointer outline-none focus:border-red-500"
                  >
                    <option value="name">Név</option>
                    <option value="age">Kor</option>
                    <option value="distance">Távolság</option>
                  </select>
                </div>
              </div>

              <button
                className={`py-2 px-4 rounded-full border-2 border-neutral-300 dark:border-neutral-600 font-bold transition-all ${isFilterOpen ? 'bg-red-500 text-white border-red-500' : 'bg-white dark:bg-neutral-700 hover:bg-red-500 hover:text-white hover:border-red-500'}`}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                ⚙️ Speciális szűrés
              </button>
            </div>

            {/* Filter Panel */}
            <div className={`overflow-hidden transition-all duration-300 ${isFilterOpen ? 'max-h-[500px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="flex flex-col gap-4 p-4 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 shadow-sm">

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-neutral-600 dark:text-neutral-400">Fajta</label>
                  <select name="fajId" value={filters.fajId} onChange={handleFilterChange} className="p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 outline-none">
                    <option value="">Bármilyen</option>
                    {fajtak.map((f) => (
                      <option key={f.id} value={f.id}>{f.fajta}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-neutral-600 dark:text-neutral-400">
                    Életkor: <strong className="text-neutral-900 dark:text-neutral-100">{filters.minKor} - {filters.maxKor} év</strong>
                  </label>
                  <div className="flex gap-2">
                    <input type="range" name="minKor" min="0" max="20" value={filters.minKor} onChange={handleFilterChange} className="w-full cursor-pointer accent-red-500" />
                    <input type="range" name="maxKor" min="0" max="20" value={filters.maxKor} onChange={handleFilterChange} className="w-full cursor-pointer accent-red-500" />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-neutral-600 dark:text-neutral-400">Ivartalanított</label>
                  <select name="ivartalanitott" value={filters.ivartalanitott} onChange={handleFilterChange} className="p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 outline-none">
                    <option value="">Mindegy</option>
                    <option value="1">Igen</option>
                    <option value="0">Nem</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-neutral-600 dark:text-neutral-400">Nem</label>
                  <select name="nem" value={filters.nem} onChange={handleFilterChange} className="p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 outline-none">
                    <option value="">Mindegy</option>
                    <option value="0">Hím</option>
                    <option value="1">Nőstény</option>
                  </select>
                </div>

                <button className="mt-2 py-2 border-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 font-bold rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors" onClick={handleApplyFilters}>
                  🔍 Szűrés alkalmazása
                </button>
              </div>
            </div>

          </div>
        </aside>

        {/* --- MAIN CONTENT SZEKCIÓ --- */}
        <main className="flex-1 w-full min-w-0 p-4 md:p-8 flex flex-col items-center">
          {layout === "grid" ? (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 p-6 w-full place-content-start z-0">
              {(paginatedCats || []).map((cat) => (
                <div
                  className="group relative flex flex-col items-center cursor-pointer rounded-xl overflow-hidden border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-sm hover:shadow-lg transition-all"
                  key={cat.cId}
                  onClick={() => setSelectedCat(cat)}
                >
                  <div className="relative w-full h-64 overflow-hidden">
                    <img
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      src={`/api/images/${cat.pKep}`}
                      alt={cat.nev || "Cica kép"}
                    />

                    <button
                      className={`absolute top-3 right-3 w-11 h-11 rounded-full border-none flex items-center justify-center text-xl z-10 transition-all duration-200 transform scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 shadow-md ${cat.isLiked
                        ? 'bg-white text-rose-600 opacity-100 scale-100'
                        : 'bg-black/60 text-white hover:bg-white hover:text-rose-600 hover:scale-110'
                        }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        const prevLiked = cat.isLiked;
                        setCats(prev => prev.map(c =>
                          c.cId === cat.cId ? { ...c, isLiked: !c.isLiked } : c
                        ));
                        handleAction(cat.cId, prevLiked);
                      }}
                      title={cat.isLiked ? "Eltávolítás a kedvencek közül" : "Kedvencekhez"}
                    >
                      ❤
                    </button>

                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none flex items-end justify-between p-3">
                      <span className="text-white font-bold text-base drop-shadow-md">{cat.nev || "Ismeretlen"}</span>
                      <span className="text-white font-bold text-base drop-shadow-md">{cat.kor || cat.age || "? év"}</span>
                    </div>

                    <span className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                      {cat.calculatedDistance !== null ? `${cat.calculatedDistance} km` : "? km"}
                    </span>
                  </div>
                </div>
              ))}
            </section>
          ) : (
            <section className="flex flex-col items-center gap-8 py-8 px-4 w-full">
              {(paginatedCats || []).map((cat) => (
                <div className="w-full max-w-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-sm" key={cat.cId}>

                  {/* Poszt Fejléc */}
                  <div className="flex items-center p-3 gap-3 border-b border-neutral-100 dark:border-neutral-700">
                    <img
                      src={cat?.ownerPFP ? `/api/images/${cat.ownerPFP}` : avatarImg}
                      alt="gazdi"
                      className="w-11 h-11 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                      onError={(e) => { e.currentTarget.src = avatarImg; }}
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-[15px]">{cat.ownerNev || "Ismeretlen Gazdi"}</span>
                      <span className="text-[13px] text-neutral-500 dark:text-neutral-400">
                        {cat.kor || "? év"} • {cat.calculatedDistance !== null ? `${cat.calculatedDistance} km-re` : "Távolság ismeretlen"}
                      </span>
                    </div>
                  </div>

                  {/* Poszt Kép */}
                  <div className="w-full bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-700">
                    <img src={`/api/images/${cat.pKep}`} alt={cat.nev} className="w-full max-h-[650px] object-contain block bg-black/5 dark:bg-black/40" />
                  </div>

                  {/* Poszt Interakciók */}
                  <div className="flex p-2 gap-4">
                    <button
                      className={`flex items-center gap-1 p-2 rounded-lg font-semibold text-[15px] transition-colors ${cat.isLiked
                        ? 'text-rose-600 bg-rose-50 dark:bg-rose-500/10'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-rose-600 dark:hover:text-rose-400'
                        }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        const prevLiked = cat.isLiked;
                        setCats(prev => prev.map(c =>
                          c.cId === cat.cId ? { ...c, isLiked: !c.isLiked } : c
                        ));
                        handleAction(cat.cId, prevLiked);
                      }}
                    >
                      ❤ {cat.isLiked ? 'Mégsem' : 'Tetszik'}
                    </button>
                    <button
                      className="flex items-center gap-1 p-2 rounded-lg font-semibold text-[15px] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                      onClick={() => setSelectedCat(cat)}
                    >
                      💬 Részletek
                    </button>
                  </div>

                  {/* Poszt Leírás */}
                  <div className="px-4 pb-4 text-sm leading-relaxed text-neutral-800 dark:text-neutral-200">
                    <strong className="text-neutral-900 dark:text-white">{cat.nev}</strong> várja az álomgazdiját! Kattints a részletekért, ha megtetszett.
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* --- PAGINATION CONTROLS --- */}
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-4 my-8 w-full">
              <button
                className="px-4 py-2 border-2 text-sm md:text-base border-neutral-800 dark:border-neutral-200 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold rounded hover:bg-rose-600 hover:text-white hover:border-rose-600 dark:hover:bg-rose-600 dark:hover:text-white dark:hover:border-rose-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-neutral-200 dark:disabled:hover:bg-neutral-800 disabled:hover:text-neutral-900 dark:disabled:hover:text-neutral-100 disabled:border-transparent transition-all"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(1)}
              >
                &laquo; Első
              </button>
              <button
                className="px-4 py-2 border-2 text-sm md:text-base border-neutral-800 dark:border-neutral-200 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold rounded hover:bg-rose-600 hover:text-white hover:border-rose-600 dark:hover:bg-rose-600 dark:hover:text-white dark:hover:border-rose-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-neutral-200 dark:disabled:hover:bg-neutral-800 disabled:hover:text-neutral-900 dark:disabled:hover:text-neutral-100 disabled:border-transparent transition-all"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                &lsaquo; Előző
              </button>

              <span className="font-bold text-base text-neutral-800 dark:text-neutral-200 px-2">
                {currentPage} / {totalPages}
              </span>

              <button
                className="px-4 py-2 border-2 text-sm md:text-base border-neutral-800 dark:border-neutral-200 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold rounded hover:bg-rose-600 hover:text-white hover:border-rose-600 dark:hover:bg-rose-600 dark:hover:text-white dark:hover:border-rose-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-neutral-200 dark:disabled:hover:bg-neutral-800 disabled:hover:text-neutral-900 dark:disabled:hover:text-neutral-100 disabled:border-transparent transition-all"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Következő &rsaquo;
              </button>
              <button
                className="px-4 py-2 border-2 text-sm md:text-base border-neutral-800 dark:border-neutral-200 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold rounded hover:bg-rose-600 hover:text-white hover:border-rose-600 dark:hover:bg-rose-600 dark:hover:text-white dark:hover:border-rose-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-neutral-200 dark:disabled:hover:bg-neutral-800 disabled:hover:text-neutral-900 dark:disabled:hover:text-neutral-100 disabled:border-transparent transition-all"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(totalPages)}
              >
                Utolsó &raquo;
              </button>
            </div>
          )}
        </main>
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
      <footer className="mt-auto bg-neutral-900 text-neutral-100 py-10 px-5 border-t-4 border-black flex justify-center">
        <div className="flex flex-col items-center gap-3 max-w-3xl text-center">
          <h3 className="m-0 text-2xl tracking-wide font-bold">Cicagramm</h3>
          <p className="m-0 text-neutral-400 text-sm">Találd meg a tökéletes doromboló társat!</p>
          <p className="mt-5 text-xs text-neutral-500">
            &copy; {new Date().getFullYear()} Cicagramm. Minden jog fenntartva.
          </p>
        </div>
      </footer>
    </div>
  );
}