import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import avatarImg from './assets/default_profile_icon.webp';
import { useNavigate } from 'react-router-dom';
import "./CatProfile.css";
import "./Topbar.jsx";

export default function CatProfile({ catId, hideOwnerLink = false }) {
  const [catData, setCatData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
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
      <div className="p-5 animate-pulse space-y-8">

        {/* Top section: cat image + stats | owner box */}
        <div className="flex justify-between flex-wrap gap-5">
          {/* Left: cat image + stats */}
          <div className="flex gap-5 items-start">
            <div className="w-40 h-40 rounded-2xl bg-neutral-200 dark:bg-neutral-700 shrink-0" />
            <div className="flex flex-col gap-2.5 pt-1">
              <div className="h-7 w-32 rounded bg-neutral-200 dark:bg-neutral-700" />
              <div className="h-4 w-24 rounded bg-neutral-200 dark:bg-neutral-700" />
              <div className="h-4 w-28 rounded bg-neutral-200 dark:bg-neutral-700" />
              <div className="h-4 w-20 rounded bg-neutral-200 dark:bg-neutral-700" />
              <div className="h-4 w-24 rounded bg-neutral-200 dark:bg-neutral-700" />
              <div className="h-4 w-20 rounded bg-neutral-200 dark:bg-neutral-700" />
            </div>
          </div>

          {/* Right: owner box */}
          <div className="flex-1 min-w-[250px] bg-neutral-100 dark:bg-neutral-800 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 flex flex-col gap-4">
            <div className="h-5 w-1/3 rounded bg-neutral-200 dark:bg-neutral-700 border-b border-neutral-300 dark:border-neutral-600 pb-2" />
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-neutral-300 dark:bg-neutral-600 shrink-0" />
              <div className="flex flex-col gap-2">
                <div className="h-4 w-24 rounded bg-neutral-200 dark:bg-neutral-700" />
                <div className="h-3 w-36 rounded bg-neutral-200 dark:bg-neutral-700" />
              </div>
            </div>
            <div className="h-3 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700" />
          </div>
        </div>

        {/* Description section */}
        <div className="flex flex-col gap-2">
          <div className="h-5 w-20 rounded bg-neutral-200 dark:bg-neutral-700" />
          <div className="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
          <div className="h-4 w-4/5 rounded bg-neutral-200 dark:bg-neutral-700" />
        </div>

        {/* Gallery section */}
        <div className="flex flex-col gap-3">
          <div className="h-5 w-40 rounded bg-neutral-200 dark:bg-neutral-700" />
          <div className="flex gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-[120px] h-[120px] rounded-xl bg-neutral-200 dark:bg-neutral-700 shrink-0" />
            ))}
          </div>
        </div>

      </div>
    );
  }

  const owner = catData.owner;

  return (

    <div className={`p-5 flex flex-col gap-10
    transition-all duration-500 ease-out
    ${visible ? "opacity-100 blur-0 scale-100"
        : "opacity-0 blur-sm scale-95"}
  `}>
      {/* FELSŐ SZEKCIÓ: PFP, Macska adatok, Gazda adatok */}
      <div className="flex justify-between flex-wrap gap-5">
        <div className="flex gap-5 items-start">
          {/* Fő profilkép (PFP) - Klikkelhető zoomoláshoz */}
          <img fetchPriority="high"
            src={`/api/images/${catData.pKep}`}
            alt="Cica PFP"
            className="w-40 h-40 rounded-2xl object-cover border-2 border-neutral-900 dark:border-neutral-700 shrink-0 cursor-pointer transition-all duration-200 ease-in-out hover:scale-[1.03] hover:shadow-lg"
            onClick={() => setZoomedImage(catData.pKep)}

          />

          {/* Macska adatai */}
          <div className="flex flex-col">
            <h2 className="m-0 mb-2.5 text-2xl font-bold">{catData.nev || "Névtelen"}</h2>
            <p className="my-1 text-[15px]"><strong>Kor:</strong> {catData.kor} év</p>
            <p className="my-1 text-[15px]"><strong>Fajta:</strong> {catData.species.fajta || "Keverék"}</p>
            <p className="my-1 text-[15px]"><strong>Súly:</strong> {catData.tomeg ? `${catData.tomeg} kg` : "N/A"}</p>
            <p className="my-1 text-[15px]"><strong>Ivartalanítva:</strong> {catData.ivartalanitott ? "Igen" : "Nem"}</p>
            <p className="my-1 text-[15px]"><strong>Nem:</strong> {catData.nem ? "Nőstény" : "Hím"}</p>
          </div>
        </div>

        {/* Gazda adatai */}
        {owner && (
          <div className="flex-1 min-w-[250px] bg-neutral-100 dark:bg-neutral-800 p-4 rounded-xl border border-neutral-300 dark:border-neutral-700 flex flex-col gap-4">
            <h3 className="m-0 border-b-2 border-neutral-300 dark:border-neutral-700 pb-1 font-bold text-lg">Gazdi adatai</h3>

            <div className="flex items-center gap-4">
              {/* Gazdi profilképe - Klikkelhető zoomoláshoz */}
              <img fetchPriority="high"
                src={`/api/images/${owner.pKep}`}
                alt="Gazdi PFP"
                className="w-[60px] h-[60px] rounded-full object-cover border-2 border-neutral-900 dark:border-neutral-700 cursor-pointer transition-all duration-200 ease-in-out hover:scale-[1.03] hover:shadow-lg"
                onClick={() => setZoomedImage(owner.pKep)}
                onError={(e) => {
                  e.currentTarget.src = avatarImg;
                  e.currentTarget.onerror = null;
                }}
              />
              <div className="flex flex-col">
                {hideOwnerLink ? (
                  <p className="m-0 mb-1 text-lg font-bold"><strong>{owner.nev}</strong></p>
                ) : (
                  <p className="m-0 mb-1 text-lg font-bold cursor-pointer" onClick={() => {
                    document.body.style.overflow = 'unset';
                    navigate(`/users/${owner.id}`, { state: { resetTab: true } });
                  }}><strong>{owner.nev}</strong></p>
                )}
                <p className="m-0 mb-1"><a className="text-rose-600 hover:underline" href={`mailto:${owner.email}`}>{owner.email}</a></p>
              </div>
            </div>

            <div className="flex flex-col">
              {owner.rBemutat && (
                <p className="my-1 text-sm leading-relaxed"><strong>Bemutatkozás:</strong> {owner.rBemutat}</p>
              )}
              <p className="my-1 text-sm leading-relaxed">
                <strong>Cím:</strong> {owner.irsz} {owner.varos}, {owner.utca} {owner.hazszam ? owner.hazszam : ''}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* KÖZÉPSŐ SZEKCIÓ: Leírás */}
      <div className="flex flex-col">
        <h3 className="mt-0 mb-2.5 font-bold text-xl">Leírás</h3>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          {catData.rBemutat || "Nincs megadva leírás ehhez a cicához."}
        </p>
      </div>

      {/* ALSÓ SZEKCIÓ: Többi kép (Thumbnail grid) */}
      {catData.images && catData.images.length > 0 && (
        <div className="flex flex-col">
          <h3 className="mt-0 mb-2.5 font-bold text-xl">Többi kép a macskáról</h3>
          <div className="flex gap-4 overflow-x-auto pb-2.5">
            {catData.images.map((kep, index) => (
              <img fetchPriority="high"
                key={index}
                src={`/api/images/${kep.mkepId}`}
                alt={`Kép ${index + 1}`}
                className="w-[120px] h-[120px] rounded-xl object-cover border-2 border-neutral-900 dark:border-neutral-700 shrink-0 cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-lg hover:border-rose-600"
                onClick={() => setZoomedImage(kep.mkepId)}
              />
            ))}
          </div>
        </div>
      )}

      {zoomedImage && ReactDOM.createPortal(
        <div
          className="fixed inset-0 bg-black/90 z-30000 flex justify-center items-center cursor-default animate-[fadeIn_0.2s_ease-out]"
          onClick={() => {
            setZoomedImage(null);
            setIsZoomedIn(false);
          }}
        >
          <button
            className="absolute top-[25px] right-[30px] bg-transparent border-none text-white/70 text-[45px] leading-none cursor-pointer z-30001 p-0 transition-all duration-200 ease-in-out hover:text-white hover:scale-110"
            onClick={(e) => {
              e.stopPropagation();
              setZoomedImage(null);
              setIsZoomedIn(false);
            }}
          >
            &times;
          </button>
          <img fetchPriority="high"
            src={`/api/images/${zoomedImage}`}
            alt="Zoomed"
            className={`max-w-[70vw] max-h-[70vh] object-contain cursor-zoom-in rounded-lg shadow-2xl transition-transform duration-300 ease-in-out ${isZoomedIn ? "scale-150 cursor-zoom-out" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomedIn(!isZoomedIn);
            }}
            onError={(e) => {
              e.currentTarget.src = avatarImg;
              e.currentTarget.onerror = null;
            }}
          />
        </div>,
        document.body
      )}
    </div>
  );
}