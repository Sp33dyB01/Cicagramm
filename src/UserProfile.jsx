import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { authClient } from "./auth-client";
import avatarImg from "./assets/default_profile_icon.webp";
import EditCatModal from "./EditCatModal";
import { Heart, Trash2 } from "lucide-react";
import Modal from "./Modal";
import CatProfile from "./CatProfile";

const UserProfile = () => {
  const { userId } = useParams();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('uploads'); // 'uploads' or 'favorites'
  const [currentUser, setCurrentUser] = useState(null);
  const [editingCat, setEditingCat] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [catToDelete, setCatToDelete] = useState(null);

  useEffect(() => {
    setActiveTab('uploads');
    setSelectedCatId(null);
  }, [userId, location.key]);

  useEffect(() => {
    async function checkSession() {
      try {
        const { data } = await authClient.getSession();
        if (data?.session) {
          setCurrentUser(data.user);
        }
      } catch (error) {
        console.error("Hiba a session ellenőrzésekor:", error);
      }
    }
    checkSession();
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/profile/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          console.error(data.error);
          setUser(null);
        } else {
          setUser(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Hiba a felhasználó betöltésekor:", err);
        setLoading(false);
      });
  }, [userId, refreshKey]);

  useEffect(() => {
    if (activeTab === 'favorites' && currentUser && currentUser.id === user?.id) {
      setLoadingFavorites(true);
      fetch(`/api/kedvencek/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setFavorites(data);
          } else {
            console.error(data.error);
            setFavorites([]);
          }
          setLoadingFavorites(false);
        })
        .catch(err => {
          console.error("Hiba a kedvencek betöltésekor:", err);
          setLoadingFavorites(false);
        });
    }
  }, [activeTab, userId, currentUser, user?.id, refreshKey]);

  const handleUnlike = async (catId, e) => {
    e.stopPropagation(); // Prevent opening the cat modal if we ever add one

    // Optimistic UI update
    setFavorites(prev => prev.filter(item => {
      const id = item.cat ? item.cat.cId : item.cId || item.id;
      return id !== catId;
    }));

    try {
      const response = await fetch(`/api/kedvencek/${catId}`, { method: 'DELETE' });
      if (!response.ok) {
        console.error("Nem sikerült törölni a kedvencek közül:", response.statusText);
        // Opcionális: visszaállítani a state-et hiba esetén
      }
    } catch (error) {
      console.error("Hálózati hiba a törlés során:", error);
    }
  };

  const confirmDelete = async () => {
    if (!catToDelete) return;
    const catId = catToDelete.cId || catToDelete.id;

    // A modal azonnali bezárása
    setCatToDelete(null);

    // Optimisan töröljük a listából
    setUser(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        cats: prev.cats.filter(cat => cat.cId !== catId)
      };
    });

    try {
      const response = await fetch(`/api/cica/${catId}`, { method: 'DELETE' });
      if (!response.ok) {
        console.error("Nem sikerült a törlés:", response.statusText);
        // Ha valamiért mégsem törlődött a backendről, akkor érdemes visszatölteni
        setRefreshKey(prev => prev + 1);
      }
    } catch (error) {
      console.error("Hálózati hiba a törlés során:", error);
      setRefreshKey(prev => prev + 1);
    }
  };

  if (loading) {
    return <div className="min-h-[50vh] flex justify-center items-center text-neutral-500">Betöltés...</div>;
  }

  if (!user) {
    return <div className="min-h-[50vh] flex justify-center items-center text-neutral-500">A felhasználó nem található.</div>;
  }

  return (
    <div className="w-full flex-1 flex flex-col max-w-7xl mx-auto p-4 pt-24 sm:p-6 sm:pt-28 lg:p-8 lg:pt-32 text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Profile Picture Section */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8 p-6 bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 shrink-0">
        <div className="relative shrink-0">
          <img fetchPriority="high"
            src={`/api/images/${user.pKep}` || avatarImg}
            alt="User Profile"
            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-neutral-100 dark:border-neutral-700 shadow-md"
            onError={(e) => {
              e.currentTarget.src = avatarImg
              e.currentTarget.onerror = null;
            }}
          />
        </div>
        <div className="flex flex-col text-center md:text-left">
          <h2 className="text-3xl font-bold mb-2">{user.nev}</h2>
          <p className="text-neutral-600 dark:text-neutral-400 italic text-lg">{user.rBemutat || "Még nincs rövid bemutatkozás"}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-6 border-b border-neutral-200 dark:border-neutral-700 mb-8 px-2 shrink-0">
        <button
          className={`pb-3 px-2 font-semibold text-lg transition-colors relative ${activeTab === 'uploads'
            ? 'text-rose-600 dark:text-rose-500'
            : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          onClick={() => setActiveTab('uploads')}
        >
          {user.nev} feltöltései
          {activeTab === 'uploads' && (
            <div className="absolute -bottom-px left-0 right-0 h-0.5 bg-rose-600 dark:bg-rose-500 rounded-t-full"></div>
          )}
        </button>
        {currentUser && currentUser.id === user.id && (
          <button
            className={`pb-3 px-2 font-semibold text-lg transition-colors relative ${activeTab === 'favorites'
              ? 'text-rose-600 dark:text-rose-500'
              : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            onClick={() => setActiveTab('favorites')}
          >
            Kedvencek
            {activeTab === 'favorites' && (
              <div className="absolute -bottom-px left-0 right-0 h-0.5 bg-rose-600 dark:bg-rose-500 rounded-t-full"></div>
            )}
          </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'uploads' && (
        <div className="pb-10 flex-1 flex flex-col">
          {user.cats && user.cats.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-2">
              {user.cats.map((cat) => (
                <div
                  key={cat.cId}
                  onClick={() => {
                    if (currentUser && currentUser.id === user.id) {
                      setEditingCat(cat);
                    } else {
                      setSelectedCatId(cat.cId);
                    }
                  }}
                  className={`cursor-pointer relative rounded-2xl overflow-hidden shadow-lg bg-neutral-200 dark:bg-neutral-800 transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl group h-[350px] sm:h-[400px]`}
                >
                  <img fetchPriority="high"
                    src={`/api/images/${cat.pKep}`}
                    alt={cat.nev || "Cica kép"}
                    className="w-full h-full object-cover select-none"
                    onError={(e) => {
                      e.currentTarget.src = avatarImg
                      e.currentTarget.onerror = null;
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/80 to-transparent">
                    <span className="text-2xl font-bold text-white drop-shadow-md">{cat.nev || "Ismeretlen"}</span>
                  </div>

                  {currentUser && currentUser.id === user.id && (
                    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCatToDelete(cat);
                        }}
                        className="bg-black/40 hover:bg-black/60 backdrop-blur-sm p-2.5 rounded-full text-white hover:text-rose-500 transition-colors shadow-lg border border-black/10 group/btn"
                        title="Feltöltött macska törlése"
                      >
                        <Trash2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-10 flex flex-col justify-center items-center text-center border border-neutral-200 dark:border-neutral-700 border-dashed">
              <p className="text-neutral-500 dark:text-neutral-400 italic text-lg">Ennek a felhasználónak nincsenek még feltöltött cicái.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'favorites' && (
        <div className="pb-10 flex-1 flex flex-col">
          {loadingFavorites ? (
            <div className="flex-1 flex justify-center items-center">Betöltés...</div>
          ) : favorites && favorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-2">
              {favorites.map((favItem) => {
                const cat = favItem.cat || favItem; // just in case the API returns the cat object directly or wrapped via favItem.cat
                if (!cat) return null;
                return (
                  <div
                    key={`fav-${cat.cId || cat.id}`}
                    onClick={() => setSelectedCatId(cat.cId || cat.id)}
                    className="cursor-pointer relative rounded-2xl overflow-hidden shadow-lg bg-neutral-200 dark:bg-neutral-800 transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl group h-[350px] sm:h-[400px]"
                  >
                    <img fetchPriority="high"
                      src={`/api/images/${cat.pKep}`}
                      alt={cat.nev || "Cica kép"}
                      className="w-full h-full object-cover select-none"
                      onError={(e) => {
                        e.currentTarget.src = avatarImg
                        e.currentTarget.onerror = null;
                      }}
                    />
                    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                      {currentUser && currentUser.id === user?.id && (
                        <button
                          onClick={(e) => handleUnlike(cat.cId || cat.id, e)}
                          className="bg-black/40 hover:bg-black/60 backdrop-blur-sm p-2.5 rounded-full text-rose-500 transition-colors shadow-lg border border-black/10 group/btn"
                          title="Eltávolítás a kedvencek közül"
                        >
                          <Heart className="w-6 h-6 group-hover/btn:scale-110 transition-transform" fill="currentColor" />
                        </button>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/80 to-transparent">
                      <span className="text-2xl font-bold text-white drop-shadow-md">{cat.nev || "Ismeretlen"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-10 flex flex-col justify-center items-center text-center border border-neutral-200 dark:border-neutral-700 border-dashed">
              <p className="text-neutral-500 dark:text-neutral-400 italic text-lg">Ennek a felhasználónak nincsenek még kedvenc cicái.</p>
            </div>
          )}
        </div>
      )}

      {editingCat && (
        <EditCatModal
          cat={editingCat}
          onClose={() => setEditingCat(null)}
          onSave={() => {
            setEditingCat(null);
            setRefreshKey((prev) => prev + 1);
          }}
        />
      )}

      <Modal
        isOpen={!!selectedCatId}
        onClose={() => setSelectedCatId(null)}
      >
        {selectedCatId && <CatProfile catId={selectedCatId} hideOwnerLink={activeTab === 'uploads'} />}
      </Modal>

      <Modal
        isOpen={!!catToDelete}
        onClose={() => setCatToDelete(null)}
        maxWidth="420px"
      >
        {catToDelete && (
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-6">
              <Trash2 className="w-8 h-8 text-rose-600 dark:text-rose-500" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">Cica törlése</h3>
            <p className="text-lg mb-8 text-neutral-600 dark:text-neutral-400 max-w-sm">
              Biztosan törölni szeretnéd a(z) <strong className="text-neutral-900 dark:text-neutral-100">{catToDelete.nev}</strong> nevű cicát? Ezt a műveletet <span className="text-rose-600 dark:text-rose-500 font-semibold">nem lehet visszavonni!</span>
            </p>
            <div className="flex w-full justify-center gap-4">
              <button
                onClick={() => setCatToDelete(null)}
                className="px-6 py-3 min-w-[120px] rounded-xl font-bold bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors"
              >
                Mégsem
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-3 min-w-[120px] rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                Törlés
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserProfile;
