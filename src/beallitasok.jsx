import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import avatarImg from "./assets/avatar.png"; // Make sure the path matches MainApp.jsx
import { useToast } from "./Toast";
// This component receives the logged-in user object as a prop
export default function Beallitasok({ user, onUpdate }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // --- CITY FETCHING STATES ---
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);

  // Initialize form state with the current user's data
  const [formData, setFormData] = useState({
    email: user?.email || '',
    nev: user?.nev || user?.name || '',
    rBemutat: user?.rBemutat || '',
    irsz: user?.irsz || '',
    varos: user?.varos || '',
    utca: user?.utca || '',
    pKep: null, // This will hold the File object if a new picture is selected
  });

  // Sync formData when user prop updates (e.g. after a successful save)
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || prev.email,
        nev: user.nev || user.name || prev.nev,
        rBemutat: user.rBemutat !== undefined ? user.rBemutat : prev.rBemutat,
        irsz: user.irsz || prev.irsz,
        varos: user.varos || prev.varos,
        utca: user.utca || prev.utca,
      }));
    }
  }, [user]);

  // Effect to fetch cities when the postal code (irsz) changes
  useEffect(() => {
    if (formData.irsz && String(formData.irsz).length === 4) {
      const fetchCities = async () => {
        setLoadingCities(true);
        setCities([]);
        // Do not reset city here, so the user's saved city remains visible
        // setFormData(prev => ({ ...prev, varos: '' })); 

        try {
          const res = await fetch(`/api/varos/${formData.irsz}`);
          if (res.ok) {
            const data = await res.json();
            setCities(data);
            if (data.length === 1) {
              setFormData(prev => ({ ...prev, varos: data[0].nev }));
            }
          }
        } catch (err) {
          console.error("Failed to fetch cities", err);
        } finally {
          setLoadingCities(false);
        }
      };

      fetchCities();
    } else {
      setCities([]); // Clear cities if postal code is not 4 digits
    }
  }, [formData.irsz]);

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
      submissionData.append('pKep', formData.pKep);
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

  // If there's no user, don't render the form
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <p>A beállítások megtekintéséhez be kell jelentkezned.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-4xl bg-white border rounded-lg p-6">
        <h1 className="text-3xl text-center mb-6 font-semibold">
          {user.nev} beállításai
        </h1>



        <form onSubmit={handleSubmit} className="space-y-3">

          {/* --- New Profile Section (Display Only) --- */}
          <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-6 mb-4 border-b pb-6">
            <div
              className="relative w-32 h-32 cursor-pointer group rounded-full overflow-hidden border-4 border-black shadow-lg flex-shrink-0"
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
              <p className="text-gray-600 italic">{user?.rBemutat || "Nincs megadva bemutatkozás."}</p>
            </div>
          </div>

          <h3 className="text-xl font-semibold pt-4">Adatok módosítása</h3>

          {/* Email is read-only */}
          <input
            className="w-full px-3 py-2 border rounded bg-gray-200 text-gray-500"
            placeholder="E-mail"
            type="email"
            value={formData.email}
            readOnly
          />

          <input
            className="w-full px-3 py-2 border rounded bg-gray-50"
            placeholder="Felhasználónév"
            value={formData.nev}
            onChange={(e) => setFormData({ ...formData, nev: e.target.value })}
          />
          <textarea
            className="w-full px-3 py-2 border rounded bg-gray-50"
            placeholder="Rövid bemutatkozás"
            rows="3"
            value={formData.rBemutat}
            onChange={(e) => setFormData({ ...formData, rBemutat: e.target.value })}
          />

          {/* Address Section */}
          <div className="flex gap-2">
            <input
              type="number"
              className="w-1/3 px-3 py-2 border rounded bg-gray-50"
              placeholder="Irsz"
              value={formData.irsz}
              onChange={(e) => setFormData({ ...formData, irsz: e.target.value })}
            />
            <div className="w-2/3 relative">
              {loadingCities ? (
                <div className="w-full px-3 py-2 border rounded bg-gray-100 text-gray-500 italic">
                  Keresés...
                </div>
              ) : cities.length > 1 ? (
                <select
                  className="w-full px-3 py-2 border rounded bg-gray-50"
                  value={formData.varos}
                  onChange={(e) => setFormData({ ...formData, varos: e.target.value })}
                >
                  <option value="">-- Válassz --</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.nev}>
                      {c.nev}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="w-full px-3 py-2 border rounded bg-gray-50"
                  placeholder="Város"
                  value={formData.varos}
                  onChange={(e) => setFormData({ ...formData, varos: e.target.value })}
                  readOnly={cities.length === 1 && formData.irsz.length === 4}
                  style={cities.length === 1 && formData.irsz.length === 4 ? { backgroundColor: '#e8f0fe' } : {}}
                />
              )}
            </div>
          </div>

          <input
            className="w-full px-3 py-2 border rounded bg-gray-50"
            placeholder="Utca, házszám"
            value={formData.utca}
            onChange={(e) => setFormData({ ...formData, utca: e.target.value })}
          />


          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 text-white rounded font-semibold transition-colors ${loading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {loading ? "Mentés..." : "Módosítások mentése"}
          </button>
        </form>
      </div>
    </div>
  );
}
