import avatarImg from "./assets/avatar.png";
import catIcon from "./assets/icon-of-a-cat-face--transparent--simplified--insta.png";
import { authClient } from "./auth-client";
import { useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from 'react';
import './MainApp.css';
import type { SelectFelhasznalo } from '../worker/schema'
import { useToast } from './Toast';
export default function TopBar({ user, onLogout }: { user: SelectFelhasznalo, onLogout: () => void }) {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(false); // New Theme State
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const handleLogoClick = () => {
    navigate('/');
    // ensure the page scrolls back to top when the logo is clicked
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const logOut = async () => {
    try {
      await authClient.signOut();
      onLogout();
      window.location.reload();
    } catch (error) {
      showToast("Hiba a kijelentkezéskor", "error");
      console.error("Hiba a kijelentkezéskor:", error);
    }
  };
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      setIsDark(true);
    }
  }, []);
  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // If scrolling down AND past the header height (70px), hide it
      if (currentScrollY > lastScrollY && currentScrollY > 70) {
        setShowHeader(false);
      } else {
        // If scrolling up, show it
        setShowHeader(true);
      }

      setLastScrollY(currentScrollY);
    };

    // Initialize theme from system preference or localStorage



    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header className={`fixed top-0 w-full h-[70px] bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 z-50 flex items-center px-5 gap-5 transition-transform duration-300 ${!showHeader ? "-translate-y-full shadow-none" : ""}`}>
      <img
        src={catIcon}
        alt="logo"
        className="w-12 h-12 rounded-lg object-cover border border-neutral-400 dark:border-neutral-600 flex-shrink-0 cursor-pointer"
        onClick={handleLogoClick}
      />

      {/* Spacer to push controls to the right */}
      <div className="flex-1"></div>

      <div className="flex items-center gap-4 ml-auto text-neutral-900 dark:text-neutral-100">

        {/* THE DARK MODE TOGGLE */}
        <button className="p-2 flex items-center justify-center text-xl border-2 border-neutral-200 dark:border-neutral-600 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors" onClick={toggleTheme} title="Téma váltása">
          {isDark ? "🌙" : "☀️"}
        </button>

        {user ? (
          <div className="relative" ref={profileRef}>
            <img
              src={`/api/images/${user.pKep}`}
              alt="profile"
              className="w-10 h-10 rounded-full border border-neutral-800 dark:border-neutral-200 cursor-pointer object-cover"
              onClick={() => setOpen(!open)}
              onError={(e) => {
                e.currentTarget.src = avatarImg;
                e.currentTarget.onerror = null;
              }}
            />
            {open && (
              <div className="absolute top-[60px] right-0 w-48 bg-white dark:bg-neutral-800 border-2 border-neutral-800 dark:border-neutral-200 rounded-[10px] shadow-xl flex flex-col py-2 z-50 overflow-hidden text-neutral-900 dark:text-neutral-100 font-semibold text-sm">
                <div className="px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer transition-colors" onClick={() => { setOpen(false); navigate(`/users/${user.id}`); }}>Profil</div>
                <div className="px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer transition-colors" onClick={() => { setOpen(false); navigate("/beallitasok"); }}>Beállítások</div>
                <div className="px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer transition-colors" onClick={() => { setOpen(false); navigate("/uploads") }}>Feltöltés</div>
                {user.admin && <div className="px-4 py-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer transition-colors" onClick={() => { setOpen(false); navigate("/admin") }}>Admin felület</div>}
                <div className="px-4 py-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer transition-colors border-t border-neutral-100 dark:border-neutral-700" onClick={logOut}>Kijelentkezés</div>
              </div>
            )}
          </div>
        ) : (
          <h4 className="font-bold cursor-pointer hover:text-rose-600 transition-colors" onClick={() => navigate("/login")}>
            Bejelentkezés/Regisztráció
          </h4>
        )}
      </div>
    </header>
  );
}
