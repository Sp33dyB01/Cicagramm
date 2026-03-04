import avatarImg from "./assets/default_profile_icon.webp";
import { PawPrint, Heart, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactDOM from "react-dom";

export default function CatsFeed({
    layout,
    paginatedCats,
    loading,
    setSelectedCat,
    setCats,
    handleAction,
    currentPage,
    totalPages,
    handlePageChange
}) {
    const [doubleTapCat, setDoubleTapCat] = useState(null);
    const [zoomedPfp, setZoomedPfp] = useState(null);
    const navigate = useNavigate();

    const handleDoubleTap = (e, cat) => {
        e.stopPropagation();
        if (!cat.isLiked && handleAction(cat.cId, cat.isLiked)) {
            setCats(prev => prev.map(c =>
                c.cId === cat.cId ? { ...c, isLiked: true } : c
            ));
        }
        setDoubleTapCat(cat.cId);
        setTimeout(() => setDoubleTapCat(null), 700);
    };

    if (loading) {
        return (
            <main className="flex-1 w-full min-w-0 p-4 md:p-8 flex flex-col items-center justify-center min-h-[50vh] gap-5">
                <div className="paw-print-loader">
                    <div className="paw paw-1"><PawPrint className="w-6 h-6" /></div>
                    <div className="paw paw-2"><PawPrint className="w-6 h-6" /></div>
                    <div className="paw paw-3"><PawPrint className="w-6 h-6" /></div>
                </div>
                <p className="text-lg font-bold text-neutral-600 dark:text-neutral-400">Cicák cserkészése...</p>
            </main>
        );
    }

    if (!paginatedCats || paginatedCats.length === 0) {
        return (
            <main className="flex-1 w-full min-w-0 p-4 md:p-8 flex flex-col items-center">
                <div>Nincsenek macskák.</div>
            </main>
        );
    }

    return (
        <main className="flex-1 w-full min-w-0 p-4 md:p-8 flex flex-col items-center">
            {layout === "grid" ? (
                <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-6 w-full justify-center z-0 max-w-[1500px]">
                    {(paginatedCats || []).map((cat) => (
                        <div
                            className="group relative flex flex-col items-center cursor-pointer rounded-xl overflow-hidden border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-sm hover:shadow-lg transition-all"
                            key={cat.cId}
                            onClick={() => setSelectedCat(cat)}
                            onDoubleClick={(e) => handleDoubleTap(e, cat)}
                        >
                            <div className="relative w-full h-[320px] overflow-hidden">
                                <img fetchPriority="high"
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    src={`/api/images/${cat.pKep}`}
                                    alt={cat.nev || "Cica kép"}
                                />

                                <button
                                    className={`cursor-pointer absolute top-3 right-3 w-11 h-11 rounded-full border-none flex items-center justify-center text-xl z-10 transition-all duration-200 transform scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 shadow-md ${cat.isLiked
                                        ? 'bg-white text-rose-600 opacity-100 scale-100'
                                        : 'bg-black/60 text-white hover:bg-white hover:text-rose-600 hover:scale-110'
                                        }`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const prevLiked = cat.isLiked;
                                        if (handleAction(cat.cId, prevLiked)) {
                                            setCats(prev => prev.map(c =>
                                                c.cId === cat.cId ? { ...c, isLiked: !c.isLiked } : c
                                            ));
                                        }
                                    }}
                                    title={cat.isLiked ? "Eltávolítás a kedvencek közül" : "Kedvencekhez"}
                                >
                                    <Heart className="w-6 h-6" fill={cat.isLiked ? "currentColor" : "none"} />
                                </button>

                                {/* Double-tap heart burst */}
                                {doubleTapCat === cat.cId && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                                        <Heart className="w-20 h-20 text-white drop-shadow-xl animate-[heartPop_0.7s_ease-out_forwards]" fill="currentColor" />
                                    </div>
                                )}

                                <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/80 to-transparent pointer-events-none flex items-end justify-between p-3">
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
                                <img fetchPriority="high"
                                    src={cat?.ownerPFP ? `/api/images/${cat.ownerPFP}` : avatarImg}
                                    alt="gazdi"
                                    className="w-11 h-11 rounded-full object-cover border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:opacity-90 transition-opacity"
                                    onError={(e) => { e.currentTarget.src = avatarImg; }}
                                    onClick={() => cat?.ownerPFP && setZoomedPfp(cat.ownerPFP)}
                                />
                                <div className="flex flex-col">
                                    <span className="font-bold text-[15px] hover:cursor-pointer" onClick={() => navigate(`users/${cat.felId}`)}>{cat.ownerNev || "Ismeretlen Gazdi"}</span>
                                    <span className="text-[13px] text-neutral-500 dark:text-neutral-400">
                                        {cat.kor || "? év"} • {cat.calculatedDistance !== null ? `${cat.calculatedDistance} km-re` : "Távolság ismeretlen"}
                                    </span>
                                </div>
                            </div>

                            {/* Poszt Kép */}
                            <div
                                className="w-full bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-700 relative"
                                onDoubleClick={(e) => handleDoubleTap(e, cat)}
                            >
                                <img fetchPriority="high" src={`/api/images/${cat.pKep}`} alt={cat.nev} className="w-full max-h-[650px] object-contain block bg-black/5 dark:bg-black/40" />
                                {/* Double-tap heart burst */}
                                {doubleTapCat === cat.cId && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                        <Heart className="w-24 h-24 text-white drop-shadow-xl animate-[heartPop_0.7s_ease-out_forwards]" fill="currentColor" />
                                    </div>
                                )}
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
                                        if (handleAction(cat.cId, prevLiked)) {
                                            setCats(prev => prev.map(c =>
                                                c.cId === cat.cId ? { ...c, isLiked: !c.isLiked } : c
                                            ));
                                        }
                                    }}
                                >
                                    <Heart className="w-4 h-4 shrink-0" fill={cat.isLiked ? "currentColor" : "none"} /> {cat.isLiked ? 'Mégsem' : 'Tetszik'}
                                </button>
                                <button
                                    className="flex items-center gap-1.5 p-2 rounded-lg font-semibold text-[15px] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                                    onClick={() => setSelectedCat(cat)}
                                >
                                    <MessageCircle className="w-4 h-4 shrink-0" /> Részletek
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
                        className="px-4 py-2 border-2 text-sm md:text-base border-neutral-800 dark:border-neutral-200 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold rounded hover:bg-rose-600 hover:text-white hover:border-rose-600 dark:hover:bg-rose-600 dark:hover:text-white dark:hover:border-rose-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-neutral-200 dark:disabled:hover:bg-neutral-800 disabled:hover:text-neutral-900 dark:disabled:hover:text-neutral-100 disabled:border-transparent transition-all cursor-pointer"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(1)}
                    >
                        &laquo; Első
                    </button>
                    <button
                        className="px-4 py-2 border-2 text-sm md:text-base border-neutral-800 dark:border-neutral-200 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold rounded hover:bg-rose-600 hover:text-white hover:border-rose-600 dark:hover:bg-rose-600 dark:hover:text-white dark:hover:border-rose-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-neutral-200 dark:disabled:hover:bg-neutral-800 disabled:hover:text-neutral-900 dark:disabled:hover:text-neutral-100 disabled:border-transparent transition-all cursor-pointer"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                    >
                        &lsaquo; Előző
                    </button>

                    <span className="font-bold text-base text-neutral-800 dark:text-neutral-200 px-2">
                        {currentPage} / {totalPages}
                    </span>

                    <button
                        className="px-4 py-2 border-2 text-sm md:text-base border-neutral-800 dark:border-neutral-200 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold rounded hover:bg-rose-600 hover:text-white hover:border-rose-600 dark:hover:bg-rose-600 dark:hover:text-white dark:hover:border-rose-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-neutral-200 dark:disabled:hover:bg-neutral-800 disabled:hover:text-neutral-900 dark:disabled:hover:text-neutral-100 disabled:border-transparent transition-all cursor-pointer"
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                    >
                        Következő &rsaquo;
                    </button>
                    <button
                        className="px-4 py-2 border-2 text-sm md:text-base border-neutral-800 dark:border-neutral-200 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold rounded hover:bg-rose-600 hover:text-white hover:border-rose-600 dark:hover:bg-rose-600 dark:hover:text-white dark:hover:border-rose-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-neutral-200 dark:disabled:hover:bg-neutral-800 disabled:hover:text-neutral-900 dark:disabled:hover:text-neutral-100 disabled:border-transparent transition-all cursor-pointer"
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(totalPages)}
                    >
                        Utolsó &raquo;
                    </button>
                </div>
            )}
            {
                zoomedPfp && ReactDOM.createPortal(
                    <div
                        className="fixed inset-0 bg-black/90 z-30000 flex justify-center items-center cursor-default"
                        onClick={() => setZoomedPfp(null)}
                    >
                        <div className="flex flex-col items-center gap-4 p-4">
                            <img
                                src={`/api/images/${zoomedPfp}`}
                                alt="Profilkép"
                                className="max-w-[70vw] max-h-[70vh] rounded-2xl object-contain shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                                onError={(e) => { e.currentTarget.src = avatarImg; e.currentTarget.onerror = null; }}
                            />
                            <button
                                className="text-white/70 text-sm hover:text-white transition-colors"
                                onClick={() => setZoomedPfp(null)}
                            >
                                Bezárás
                            </button>
                        </div>
                    </div>,
                    document.body
                )
            }
        </main>


    );
}
