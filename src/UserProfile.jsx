import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import avatarImg from "./assets/avatar.png";
import "./MainApp.css";

const UserProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('uploads'); // 'uploads' or 'favorites'

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
  }, [userId]);

  if (loading) {
    return <div>Betöltés...</div>;
  }

  if (!user) {
    return <div>A felhasználó nem található.</div>;
  }

  return (
    <div className="profile-container p-4">
      {/* Profile Picture Section */}
      <div className="flex items-center space-x-4 mb-8">
        <div className="profile-image-wrapper">
          <img
            src={`/api/images/${user.pKep}` || avatarImg}
            alt="User Profile"
            className="w-40 h-40 rounded-full object-cover"
            onError={(e) => {
              e.currentTarget.src = avatarImg
              e.currentTarget.onerror = null;
            }}
          />
        </div>
        <div className="profile-details">
          <h2 className="text-2xl font-bold">{user.nev}</h2>
          <p>{user.rBemutat || "Még nincs rövid bemutatkozás"}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b mb-6">
        <button
          className={`pb-2 px-1 font-semibold transition-colors ${activeTab === 'uploads'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
            }`}
          onClick={() => setActiveTab('uploads')}
        >
          {user.nev} feltöltései
        </button>
        <button
          className={`pb-2 px-1 font-semibold transition-colors ${activeTab === 'favorites'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
            }`}
          onClick={() => setActiveTab('favorites')}
        >
          Kedvencek
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'uploads' && (
        <div>
          {user.cats && user.cats.length > 0 ? (
            <div className="cards-grid">
              {user.cats.map((cat) => (
                <div className="tinder-card fixed-size" key={cat.cId}>
                  <div className="card large">
                    <img
                      src={`/api/images/${cat.pKep}`}
                      alt={cat.nev || "Cica kép"}
                    />
                    <div className="card small">
                      <span className="cat-info cat-name">{cat.nev || "Ismeretlen"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">Ennek a felhasználónak nincsenek még feltöltött cicái.</p>
          )}
        </div>
      )}

      {activeTab === 'favorites' && (
        <div>
          {user.fav && user.fav.length > 0 ? (
            <div className="cards-grid">
              {user.fav.map((favItem) => {
                const cat = favItem.cat;
                if (!cat) return null;
                return (
                  <div className="tinder-card fixed-size" key={`fav-${cat.cId}`}>
                    <div className="card large">
                      <img
                        src={`/api/images/${cat.pKep}`}
                        alt={cat.nev || "Cica kép"}
                      />
                      <div className="card small">
                        <span className="cat-info cat-name">{cat.nev || "Ismeretlen"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 italic">Ennek a felhasználónak nincsenek még kedvenc cicái.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfile;
