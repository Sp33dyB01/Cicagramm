import React, { useState, useEffect } from "react";
import avatarImg from './assets/avatar.png';
import "./CatProfile.css";
import "./Topbar.jsx";

export default function CatProfile({ catId }) {
  const [catData, setCatData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [visible, setVisible] = useState(false);

useEffect(() => {
  if (!loading) {
    setTimeout(() => setVisible(true), 50);
  }
}, [loading]);

  useEffect(() => {
    if (!catId) return;

    setLoading(true);
    fetch(`/api/cica/${catId}`)
      .then((res) => res.json())
      .then((data) => {
        setCatData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Hiba a macska adatainak betöltésekor:", err);
        setLoading(false);
      });
  }, [catId]);

  if (loading || !catData) {
    return (
      <div className="p-6 animate-pulse space-y-6">

        <div className="flex gap-6">
          <div className="w-40 h-40 rounded-xl skeleton-box" />

          <div className="flex-1 space-y-3">
            <div className="h-6 w-1/3 rounded skeleton-box" />
            <div className="h-4 w-1/4 rounded skeleton-box" />
            <div className="h-4 w-1/5 rounded skeleton-box" />
            <div className="h-4 w-1/6 rounded skeleton-box" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="h-5 w-1/4 rounded skeleton-box" />
          <div className="h-4 w-full rounded skeleton-box" />
          <div className="h-4 w-5/6 rounded skeleton-box" />
        </div>

      </div>
    );
  }

  const owner = catData.owner;

  return (

    <div className={`cat-profile-container
    transition-all duration-500 ease-out
    ${visible ? "opacity-100 blur-0 scale-100"
               : "opacity-0 blur-sm scale-95"}
  `}>
      {/* FELSŐ SZEKCIÓ: PFP, Macska adatok, Gazda adatok */}
      <div className="profile-top">
        <div className="profile-top-left">
          {/* Fő profilkép (PFP) - Klikkelhető zoomoláshoz */}
          <img
            src={`/api/images/${catData.pKep}`}
            alt="Cica PFP"
            className="main-pfp zoomable"
            onClick={() => setZoomedImage(catData.pKep)}

          />

          {/* Macska adatai */}
          <div className="cat-stats">
            <h2>{catData.nev || "Névtelen"}</h2>
            <p><strong>Kor:</strong> {catData.kor} év</p>
            <p><strong>Fajta:</strong> {catData.species.fajta || "Keverék"}</p>
            <p><strong>Súly:</strong> {catData.tomeg ? `${catData.tomeg} kg` : "N/A"}</p>
            <p><strong>Ivartalanítva:</strong> {catData.ivartalanitott ? "Igen" : "Nem"}</p>
            <p><strong>Nem:</strong> {catData.nem ? "Nőstény" : "Hím"}</p>
          </div>
        </div>

        {/* Gazda adatai */}
        {owner && (
          <div className="profile-top-right">
            <h3>Gazdi adatai</h3>

            <div className="owner-header">
              {/* Gazdi profilképe - Klikkelhető zoomoláshoz */}
              <img
                src={`/api/images/${owner.pKep}`}
                alt="Gazdi PFP"
                className="owner-pfp zoomable"
                onClick={() => setZoomedImage(owner.pKep)}
                onError={(e) => {
                  e.currentTarget.src = avatarImg;
                  e.currentTarget.onerror = null;
                }}
              />
              <div className="owner-basic-info">
                <p className="owner-name"><strong>{owner.nev}</strong></p>
                <p className="owner-email"><a href={`mailto:${owner.email}`}>{owner.email}</a></p>
              </div>
            </div>

            <div className="owner-details">
              {owner.rBemutat && (
                <p><strong>Bemutatkozás:</strong> {owner.rBemutat}</p>
              )}
              <p>
                <strong>Cím:</strong> {owner.irsz} {owner.varos}, {owner.utca} {owner.hazszam ? owner.hazszam : ''}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* KÖZÉPSŐ SZEKCIÓ: Leírás */}
      <div className="profile-middle">
        <h3>Leírás</h3>
        <p className="description-text">
          {catData.rBemutat || "Nincs megadva leírás ehhez a cicához."}
        </p>
      </div>

      {/* ALSÓ SZEKCIÓ: Többi kép (Thumbnail grid) */}
      {catData.images && catData.images.length > 0 && (
        <div className="profile-bottom">
          <h3>Többi kép a macskáról</h3>
          <div className="thumbnail-grid">
            {catData.images.map((kep, index) => (
              <img
                key={index}
                src={`/api/images/${kep.mkepId}`}
                alt={`Kép ${index + 1}`}
                className="thumbnail-img zoomable"
                onClick={() => setZoomedImage(kep.mkepId)}
              />
            ))}
          </div>
        </div>
      )}

      {/* DISCORD-SZERŰ IMAGE ZOOM OVERLAY */}
      {zoomedImage && (
        <div
          className="image-zoom-overlay"
          onClick={() => {
            setZoomedImage(null);
            setIsZoomedIn(false);
          }}
        >
            <button 
            className="zoom-close-btn"
            onClick={(e) => {
              e.stopPropagation(); // Megállítjuk a propagációt
              setZoomedImage(null); // Bezárjuk a zoomot
              setIsZoomedIn(false);
            }}
          >
            &times; {/* Ez a szép X karakter HTML kódja */}
          </button>
          <img
            src={`/api/images/${zoomedImage}`}
            alt="Zoomed"
            className={`zoomed-image ${isZoomedIn ? "zoomed-in" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomedIn(!isZoomedIn);
            }}
            onError={(e) => {
              e.currentTarget.src = avatarImg;
              e.currentTarget.onerror = null;
            }}
          />
        </div>
      )}
    </div>
  );
}