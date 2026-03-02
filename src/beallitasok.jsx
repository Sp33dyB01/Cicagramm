import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import avatarImg from "./assets/avatar.png"; // Make sure the path matches MainApp.jsx
import { useToast } from "./Toast";
import convertToWebP from "./helper/imageToWebP";
import { usePostal } from "./hooks/usePostal";
import { useCities } from "./hooks/useCities";

// This component receives the logged-in user object as a prop
export default function Beallitasok({ user, onUpdate }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // --- CITY FETCHING STATES ---
  const [formData, setFormData] = useState({
    email: user?.email || '',
    nev: user?.nev || user?.name || '',
    rBemutat: user?.rBemutat || '',
    irsz: user?.irsz || '',
    varos: user?.varos || '',
    utca: user?.utca || '',
    pKep: null, // This will hold the File object if a new picture is selected
  });

  const { cities, loadingCities, setCities } = usePostal(formData.irsz);
  const { postals, loadingPostal, setPostals } = useCities(formData.varos);

  // Use effects to update formData if exactly 1 result is returned
  useEffect(() => {
    if (cities.length === 1 && formData.varos !== cities[0].nev) {
      setFormData(prev => ({ ...prev, varos: cities[0].nev }));
    }
  }, [cities]);

  useEffect(() => {
    if (postals.length === 1 && String(formData.irsz) !== String(postals[0].irsz)) {
      setFormData(prev => ({ ...prev, irsz: String(postals[0].irsz) }));
    }
  }, [postals]);


  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({ ...formData, pKep: e.target.files[0] });
    }
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.nev || !formData.irsz || !formData.varos || !formData.utca) {
      showToast("A név és a cím mezők kitöltése kötelező!", "error");
      setLoading(false);
      return;
    }

    // Use FormData to handle file uploads
    const submissionData = new FormData();
    submissionData.append('nev', formData.nev);
    submissionData.append('rBemutat', formData.rBemutat);
    submissionData.append('irsz', formData.irsz);
    submissionData.append('varos', formData.varos);
    submissionData.append('utca', formData.utca);
    if (formData.pKep) {
      try {
        const webpFile = await convertToWebP(formData.pKep);
        submissionData.append('pKep', webpFile);
      } catch (error) {
        console.error("Failed to convert image to WebP:", error);
        submissionData.append('pKep', formData.pKep);
      }
    }

    try {
      const response = await fetch(`/api/profile/${user.id}`, {
        method: 'PATCH',
        body: submissionData, // No headers needed, browser sets it for FormData
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showToast("Adataid sikeresen frissítve!", "success");
        if (onUpdate) {
          onUpdate(); // Trigger state update in App.jsx
        }
      } else {
        showToast(result.error || "Hiba történt a frissítés során.", "error");
      }
    } catch (err) {
      showToast("Hiba történt a frissítés során.", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 px-4">
        <p>A beállítások megtekintéséhez be kell jelentkezned.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center bg-neutral-50 dark:bg-neutral-900 px-4 py-12 text-neutral-900 dark:text-neutral-100 transition-colors">
      <div className="w-full max-w-4xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 shadow-sm">
        <h1 className="text-3xl text-center mb-6 font-semibold">
          {user.nev} beállításai
        </h1>

        <form onSubmit={handleSubmit} className="space-y-3">

          {/* --- New Profile Section (Display Only) --- */}
          <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-6 mb-4 border-b border-neutral-200 dark:border-neutral-700 pb-6">
            <div
              className="relative w-32 h-32 cursor-pointer group rounded-full overflow-hidden border-4 border-neutral-900 dark:border-neutral-700 shadow-lg flex-shrink-0"
              onClick={handleImageClick}
              title="Kattints a profilkép módosításához"
            >
              <img
                src={formData.pKep ? URL.createObjectURL(formData.pKep) : (user?.pKep ? `/api/images/${user.pKep}` : avatarImg)}
                alt="Profilkép"
                className="w-full h-full object-cover transition-opacity group-hover:opacity-75"
                onError={(e) => {
                  e.currentTarget.src = avatarImg;
                  e.currentTarget.onerror = null;
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-40">
                <span className="text-white text-sm font-semibold">Módosítás</span>
              </div>
            </div>
            {/* hidden file input */}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />
            <div className="flex-grow w-full space-y-2">
              <h2 className="text-3xl font-bold">{user?.nev || user?.name || "Ismeretlen"}</h2>
              <p className="text-neutral-600 dark:text-neutral-400 italic">{user?.rBemutat || "Nincs megadva bemutatkozás."}</p>
            </div>
          </div>

          <h3 className="text-xl font-semibold pt-4">Adatok módosítása</h3>

          {/* Email is read-only */}
          <input
            className="w-full px-3 py-2 border rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-500 border-neutral-300 dark:border-neutral-600 outline-none"
            placeholder="E-mail"
            type="email"
            value={formData.email}
            readOnly
          />

          <div>
            <input
              className="peer w-full px-3 py-2 border rounded-lg bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:focus:border-rose-500 focus:border-rose-500 outline-none transition-colors invalid:border-rose-500 focus:invalid:border-rose-500"
              placeholder="Felhasználónév"
              required
              value={formData.nev}
              onChange={(e) => setFormData({ ...formData, nev: e.target.value })}
            />
            <p className="mt-1 text-xs text-rose-500 hidden peer-invalid:block">A felhasználónév megadása kötelező!</p>
          </div>
          <textarea
            className="w-full px-3 py-2 border rounded-lg bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:focus:border-rose-500 focus:border-rose-500 outline-none transition-colors"
            placeholder="Rövid bemutatkozás"
            rows="3"
            value={formData.rBemutat}
            onChange={(e) => setFormData({ ...formData, rBemutat: e.target.value })}
          />

          {/* Address Section */}
          <div className="flex gap-2">
            <div className="w-1/3 relative">
              {loadingPostal ? (
                <div className="w-full px-3 py-2 border rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-500 border-neutral-300 dark:border-neutral-600 italic">
                  Keresés...
                </div>
              ) : postals.length > 1 ? (
                <div>
                  <select
                    className="peer w-full h-[42px] px-3 py-2 border rounded-lg bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 outline-none focus:border-rose-500 transition-colors invalid:border-rose-500 focus:invalid:border-rose-500"
                    value={formData.irsz}
                    required
                    onChange={(e) => setFormData({ ...formData, irsz: e.target.value })}
                  >
                    <option value="">-- --</option>
                    {postals.map((p) => (
                      <option key={`irsz-${p.id}`} value={p.irsz}>
                        {p.irsz}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-rose-500 hidden peer-invalid:block">Kötelező irányítószám!</p>
                </div>
              ) : (
                <div>
                  <input
                    type="number"
                    className="peer w-full px-3 py-2 border rounded-lg bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 outline-none focus:border-rose-500 transition-colors invalid:border-rose-500 focus:invalid:border-rose-500"
                    placeholder="Irsz"
                    required
                    value={formData.irsz}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, irsz: val });
                      if (val.length !== 4) setCities([]); // Clear cities if irsz is manual and not full
                    }}
                  />
                  <p className="mt-1 text-xs text-rose-500 hidden peer-invalid:block">Kötelező!</p>
                </div>
              )}
            </div>
            <div className="w-2/3 relative">
              {loadingCities ? (
                <div className="w-full px-3 py-2 border rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-500 border-neutral-300 dark:border-neutral-600 italic">
                  Keresés...
                </div>
              ) : cities.length > 1 ? (
                <div>
                  <select
                    className="peer w-full h-[42px] px-3 py-2 border rounded-lg bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 outline-none focus:border-rose-500 transition-colors invalid:border-rose-500 focus:invalid:border-rose-500"
                    value={formData.varos}
                    required
                    onChange={(e) => setFormData({ ...formData, varos: e.target.value })}
                  >
                    <option value="">-- Válassz --</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.nev}>
                        {c.nev}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-rose-500 hidden peer-invalid:block">Kötelező város!</p>
                </div>
              ) : (
                <div>
                  <input
                    className="peer w-full px-3 py-2 border rounded-lg bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 outline-none focus:border-rose-500 transition-colors invalid:border-rose-500 focus:invalid:border-rose-500"
                    placeholder="Város"
                    required
                    value={formData.varos}
                    onChange={(e) => {
                      setFormData({ ...formData, varos: e.target.value });
                    }}
                  />
                  <p className="mt-1 text-xs text-rose-500 hidden peer-invalid:block">Kötelező!</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <input
              className="peer w-full px-3 py-2 border rounded-lg bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 outline-none focus:border-rose-500 transition-colors invalid:border-rose-500 focus:invalid:border-rose-500"
              placeholder="Utca, házszám"
              required
              value={formData.utca}
              onChange={(e) => setFormData({ ...formData, utca: e.target.value })}
            />
            <p className="mt-1 text-xs text-rose-500 hidden peer-invalid:block">Utca, házszám megadása kötelező!</p>
          </div>


          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-4 text-white rounded-lg font-bold transition-all bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            {loading ? "Mentés..." : "Módosítások mentése"}
          </button>
        </form>
      </div>
    </div>
  );
}
