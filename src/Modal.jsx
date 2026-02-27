import React, { useEffect, useState } from "react";
import "./Modal.css";

// Fontos: Ennek az időnek egyeznie kell a CSS-ben beállított transition idővel!
const ANIMATION_DURATION = 300; // ms

const Modal = ({ isOpen, onClose, children }) => {
  // Belső state: ez dönti el, hogy a komponens a DOM-ban van-e.
  const [shouldRender, setShouldRender] = useState(isOpen);

  // Belső state: ez dönti el, hogy épp a "beúszó" vagy "kiúszó" CSS osztályt kapja.
  const [animateIn, setAnimateIn] = useState(false);

  // Megakadályozzuk a háttér görgetését, ha nyitva van a modal
  useEffect(() => {
    // Ha a külső prop (isOpen) megváltozik:
    if (isOpen) {
      // 1. NYITÁS: Azonnal rendereljük és indítjuk a beúszást
      setShouldRender(true);
      // Egy pici késleltetés kell, hogy a böngésző érzékelje a változást a két állapot között
      setTimeout(() => setAnimateIn(true), 10);
      document.body.style.overflow = "hidden";
    } else {
      // 2. ZÁRÁS: Elindítjuk a kiúszást
      setAnimateIn(false);
      document.body.style.overflow = "unset";

      // Várunk, amíg az animáció lefut, és csak utána vesszük ki a DOM-ból
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, ANIMATION_DURATION);

      // Takarítás: ha közben gyorsan újra kinyitnák, ne fusson le a törlés
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Ha nem kell renderelni, akkor tényleg null-t adunk vissza
  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 w-full h-full flex justify-center items-center z-[10000] p-5 transition-all duration-300 ease-in-out ${animateIn
          ? "bg-black/70 backdrop-blur-sm opacity-100 visible"
          : "bg-transparent backdrop-blur-none opacity-0 invisible"
        }`}
      onClick={onClose}
    >
      <div
        className={`bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 w-full max-w-[600px] max-h-[90vh] rounded-2xl relative overflow-y-auto shadow-2xl border border-neutral-300 dark:border-neutral-700 transition-all duration-300 ease-in-out ${animateIn ? "scale-100 translate-y-0 opacity-100" : "scale-90 translate-y-5 opacity-0"
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-black/20 text-white text-2xl border-none cursor-pointer z-10 hover:bg-rose-600 transition-colors p-0"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;