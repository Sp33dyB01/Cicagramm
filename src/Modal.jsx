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
    // A fő konténer kap egy extra osztályt: 'open' ha animateIn igaz, különben semmi (záródik)
    <div className={`modal-overlay ${animateIn ? 'open' : ''}`} onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;