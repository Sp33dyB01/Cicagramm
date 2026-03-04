import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { authClient } from "./auth-client";
import avatarImg from "./assets/default_profile_icon.webp";
import EditCatModal from "./EditCatModal";
const UserProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('uploads'); // 'uploads' or 'favorites'
  const [currentUser, setCurrentUser] = useState(null);
  const [editingCat, setEditingCat] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

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

  if (loading) {
    return <div className="min-h-[50vh] flex justify-center items-center text-neutral-500">Betöltés...</div>;
  }

  if (!user) {
    return <div className="min-h-[50vh] flex justify-center items-center text-neutral-500">A felhasználó nem található.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 pt-24 sm:p-6 sm:pt-28 lg:p-8 lg:pt-32 text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Profile Picture Section */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8 p-6 bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
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
      <div className="flex space-x-6 border-b border-neutral-200 dark:border-neutral-700 mb-8 px-2">
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
        <div className="pb-10">
          {user.cats && user.cats.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-2">
              {user.cats.map((cat) => (
                <div
                  key={cat.cId}
                  onClick={() => {
                    if (currentUser && currentUser.id === user.id) setEditingCat(cat);
                  }}
                  className={`relative rounded-2xl overflow-hidden shadow-lg bg-neutral-200 dark:bg-neutral-800 transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl group h-[350px] sm:h-[400px] ${currentUser && currentUser.id === user.id ? 'cursor-pointer' : ''}`}
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
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-10 text-center border border-neutral-200 dark:border-neutral-700 border-dashed">
              <p className="text-neutral-500 dark:text-neutral-400 italic text-lg">Ennek a felhasználónak nincsenek még feltöltött cicái.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'favorites' && (
        <div className="pb-10">
          {user.fav && user.fav.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-2">
              {user.fav.map((favItem) => {
                const cat = favItem.cat;
                if (!cat) return null;
                return (
                  <div
                    key={`fav-${cat.cId}`}
                    className="relative rounded-2xl overflow-hidden shadow-lg bg-neutral-200 dark:bg-neutral-800 transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl group h-[350px] sm:h-[400px]"
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
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-10 text-center border border-neutral-200 dark:border-neutral-700 border-dashed">
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
    </div>
  );
};

export default UserProfile;
