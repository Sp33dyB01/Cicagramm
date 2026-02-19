import React, { useState, useEffect } from "react";
import "./CatProfile.css";

export default function CatProfile({ catId }) {
  const [catData, setCatData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [isZoomedIn, setIsZoomedIn] = useState(false);

  useEffect(() => {
    if (!catId) return;
    
    setLoading(true);
    fetch(`http://localhost:5173/api/cica/${catId}`)
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

  if (loading) return <div className="loading-state">Adatok betöltése...</div>;
  if (!catData) return <div className="error-state">Nem sikerült betölteni az adatokat.</div>;

  const owner = catData.owner;

  return (
    <div className="cat-profile-container">
      {/* FELSŐ SZEKCIÓ: PFP, Macska adatok, Gazda adatok */}
      <div className="profile-top">
        <div className="profile-top-left">
          {/* Fő profilkép (PFP) - Klikkelhető zoomoláshoz */}
          <img 
            src={`http://localhost:5173/api/images/${catData.pKep}`} 
            alt="Cica PFP" 
            className="main-pfp zoomable" 
            onClick={() => setZoomedImage(catData.pKep)}
          />
          
          {/* Macska adatai */}
          <div className="cat-stats">
            <h2>{catData.nev || "Névtelen"}</h2>
            <p><strong>Kor:</strong> {catData.kor} év</p>
            <p><strong>Fajta:</strong> {catData.fajta || "Keverék"}</p>
            <p><strong>Súly:</strong> {catData.tomeg ? `${catData.tomeg} kg` : "N/A"}</p>
            <p><strong>Ivartalanítva:</strong> {catData.ivartalanitott ? "Igen" : "Nem"}</p>
            <p><strong>Nem:</strong> {catData.nem === 0 ? "Hím" : "Nőstény"}</p>
          </div>
        </div>

        {/* Gazda adatai */}
        {owner && (
          <div className="profile-top-right">
            <h3>Gazdi adatai</h3>
            
            <div className="owner-header">
              {/* Gazdi profilképe - Klikkelhető zoomoláshoz */}
              <img 
                src={`http://localhost:5173/api/images/${owner.pKep}`} 
                alt="Gazdi PFP" 
                className="owner-pfp zoomable"
                onClick={() => setZoomedImage(owner.pKep)}
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
          {catData.leiras || "Nincs megadva leírás ehhez a cicához."}
        </p>
      </div>

      {/* ALSÓ SZEKCIÓ: Többi kép (Thumbnail grid) */}
      {catData.kepek && catData.kepek.length > 0 && (
        <div className="profile-bottom">
          <h3>Többi kép a macskáról</h3>
          <div className="thumbnail-grid">
            {catData.kepek.map((kep, index) => (
              <img 
                key={index}
                src={`http://localhost:5173/api/images/${kep}`} 
                alt={`Kép ${index + 1}`} 
                className="thumbnail-img zoomable"
                onClick={() => setZoomedImage(kep)}
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
          <img 
            src={`http://localhost:5173/api/images/${zoomedImage}`} 
            alt="Zoomed" 
            className={`zoomed-image ${isZoomedIn ? "zoomed-in" : ""}`}
            onClick={(e) => {
              e.stopPropagation(); 
              setIsZoomedIn(!isZoomedIn); 
            }}
          />
        </div>
      )}
    </div>
  );
}