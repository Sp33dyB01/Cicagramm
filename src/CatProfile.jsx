import React, { useState, useEffect } from "react";
import avatarImg from './assets/avatar.png';
import "./CatProfile.css";

export default function CatProfile({ catId }) {
  const [catData, setCatData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [isZoomedIn, setIsZoomedIn] = useState(false);

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
      
      {/* Felső rész skeleton */}
      <div className="flex gap-6">
        <div className="w-40 h-40 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>

        <div className="flex-1 space-y-3">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/5"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/6"></div>
        </div>
      </div>

      {/* Leírás skeleton */}
      <div className="space-y-3">
        <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-4/6"></div>
      </div>

      {/* Thumbnail grid skeleton */}
      <div className="grid grid-cols-3 gap-4">
        <div className="h-24 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
        <div className="h-24 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
        <div className="h-24 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
      </div>

    </div>
  );
}

  const owner = catData.owner;

  return (
    <div className="cat-profile-container">
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