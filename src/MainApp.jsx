import { useState, useRef } from "react";
import Modal from "./Modal";
import "./MainApp.css";
import { useToast } from "./Toast";
import CatProfile from "./CatProfile";
import avatarImg from "./assets/default_profile_icon.webp"; // ÚJ: Kell a fallback képhez
import { useFajtak } from "./hooks/useFajtak";
import { usePagination } from "./hooks/usePagination";
import { useFilters } from "./hooks/useFilters";
import { useCats } from "./hooks/useCats";
import { useLike } from "./hooks/useLike";
import CatsFeed from "./CatsFeed";
import { Smartphone, Grid, Settings2, Search } from "lucide-react";

export default function MainApp({ user, ipCoords }) {
  const [selectedCat, setSelectedCat] = useState(null);
  const { showToast } = useToast();
  const profileRef = useRef(null);
  const fajtak = useFajtak();
  const { currentPage, setCurrentPage, handlePageChange } = usePagination();
  const { isFilterOpen, setIsFilterOpen, filters, appliedFilters, handleApplyFilters, handleFilterChange, kivalasztottFajtak, fajtaValtozasKezelese, kivalasztottaSzinek, szinValtozasKezelese, kivalasztasTorlese } = useFilters(setCurrentPage);

  const [sort, setSort] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("sort") || "name_asc";
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

  const { handleAction } = useLike(user);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 transition-colors">
      <div className="flex flex-col md:flex-row flex-1 w-full mx-auto pt-[70px]">
        {/* Sidebar */}
        <aside className="w-full md:w-64 p-5 flex flex-col gap-5 shrink-0 bg-white dark:bg-neutral-800 border-b md:border border-neutral-200 dark:border-neutral-700 md:rounded-xl md:sticky md:top-49 md:h-[540px] md:ml-4 md:overflow-y-hidden">
          <div className="flex flex-col w-full">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center w-full">
                <button
                  className="px-3 py-1.5 border-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 rounded text-sm font-bold shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-600 transition-colors flex items-center gap-2"
                  onClick={() => setLayout(layout === "grid" ? "feed" : "grid")}
                >
                  {layout === "grid" ? (
                    <><Smartphone className="w-4 h-4" /></>
                  ) : (
                    <><Grid className="w-4 h-4" /></>
                  )}
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
                    <option value="name_asc">Név ↑</option>
                    <option value="name_desc">Név ↓</option>
                    <option value="age_asc">Kor ↑</option>
                    <option value="age_desc">Kor ↓</option>
                    <option value="distance_asc">Távolság ↑</option>
                    <option value="distance_desc">Távolság ↓</option>
                  </select>
                </div>
              </div>

              <button
                className={`py-2 px-4 rounded-full border-2 border-neutral-300 dark:border-neutral-600 font-bold transition-all flex items-center justify-center gap-2 ${isFilterOpen ? 'bg-red-500 text-white border-red-500' : 'bg-white dark:bg-neutral-700 hover:bg-red-500 hover:text-white hover:border-red-500'}`}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Settings2 className="w-5 h-5" /> Speciális szűrés
              </button>
            </div>

            {/* Filter Panel */}
            <div className={`overflow-hidden transition-all duration-300 ${isFilterOpen ? 'max-h-[500px] mt-4 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
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

                <button className="mt-2 py-2 border-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 font-bold rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors flex items-center justify-center gap-2" onClick={handleApplyFilters}>
                  <Search className="w-5 h-5" /> Szűrés alkalmazása
                </button>
              </div>
            </div>

          </div>
        </aside>

        {/* --- MAIN CONTENT SZEKCIÓ --- */}
        <CatsFeed
          layout={layout}
          paginatedCats={paginatedCats}
          loading={loading}
          setSelectedCat={setSelectedCat}
          setCats={setCats}
          handleAction={handleAction}
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
        />

        {/* --- DUMMY RIGHT SIDEBAR FOR CENTERING --- */}
        {/* Helps balance the 256px wide filter sidebar so CatsFeed is perfectly physically centered */}
        <div className="hidden md:block w-64 p-5 shrink-0 pointer-events-none md:sticky md:top-5 md:h-[385px] md:mr-4"></div>
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

    </div>
  );
}