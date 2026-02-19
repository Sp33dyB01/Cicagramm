import { useState, useEffect } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { authClient } from "./auth-client";
import { getCoordinates } from "../worker/tavolsag";
import { useNavigate } from "react-router-dom";
import retryOperation from "./assets/utils/Retry";

interface City {
  id: number;
  nev: string;
}

interface FormData {
  email: string;
  nev: string;
  jelszo: string;
  rBemutat: string;
  irsz: string;
  utca: string;
  pKep: string;
  varos: string;
}

interface RegisterProps {
  onSuccess: () => void;
}

export default function Register({ onSuccess }: RegisterProps) {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState<boolean>(false);

  const [formData, setFormData] = useState<FormData>({
    email: '',
    nev: '',
    jelszo: '',
    rBemutat: 'bemutat',
    irsz: '',
    utca: '',
    pKep: '',
    varos: '',
  });

  useEffect(() => {
    if (formData.irsz.length === 4) {
      const fetchCities = async () => {
        setLoadingCities(true);
        setCities([]);
        setFormData(prev => ({ ...prev, varos: '' }));

        try {
          const res = await fetch(`/api/varos/${formData.irsz}`);
          if (res.ok) {
            const data: City[] = await res.json();
            setCities(data);
            if (data.length === 1) {
              setFormData(prev => ({ ...prev, varos: data[0].nev }));
            }
          }
        }
        catch (err) {
          console.error("Failed to fetch cities", err);
        }
        finally {
          setLoadingCities(false);
        }
      };

      fetchCities();
    }
  }, [formData.irsz]);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.email || !formData.jelszo || !formData.nev || !formData.irsz || !formData.utca || !formData.varos) {
      setError("Kérlek tölts ki minden mezőt!");
      setLoading(false);
      return;
    }

    try {
      const coords = await getCoordinates(`${formData.irsz} ${formData.varos} ${formData.utca}`);

      const { data, error } = await retryOperation(async () =>
        authClient.signUp.email({
          email: formData.email,
          password: formData.jelszo,
          name: formData.nev,
          image: "default.jpeg",
          irsz: Number(formData.irsz),
          varos: formData.varos,
          utca: formData.utca,
          lat: coords ? coords.lat : 0,
          lon: coords ? coords.lon : 0
        }));

      if (error) {
        setError(error.message || "Hiba történt a regisztráció során.");
      } else {
        console.log("Registered user:", data);
        onSuccess();
        navigate('/login');
      }
    } catch (err) {
      setError("Hiba történt a regisztráció során.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white border rounded-lg p-6">
        <h1 className="text-4xl text-center mb-6 font-[cursive]" style={{ textAlign: 'center' }}>
          Cicagramm
        </h1>

        {error && (
          <p className="text-sm text-red-500 text-center mb-3 bg-red-50 p-2 rounded">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="w-full px-3 py-2 border rounded bg-gray-50"
            placeholder="E-mail"
            type="email"
            value={formData.email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            className="w-full px-3 py-2 border rounded bg-gray-50"
            placeholder="Felhasználónév"
            value={formData.nev}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nev: e.target.value })}
          />

          <input
            type="password"
            className="w-full px-3 py-2 border rounded bg-gray-50"
            placeholder="Jelszó"
            value={formData.jelszo}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, jelszo: e.target.value })}
          />

          {/* --- ADDRESS SECTION --- */}
          <div className="flex gap-2">
            {/* IRSZ Input */}
            <input
              type="number"
              className="w-1/3 px-3 py-2 border rounded bg-gray-50"
              placeholder="Irsz"
              value={formData.irsz}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, irsz: e.target.value })}
            />

            {/* VAROS Input - Changes based on state */}
            <div className="w-2/3 relative">
              {loadingCities ? (
                <div className="w-full px-3 py-2 border rounded bg-gray-100 text-gray-500 italic">
                  Keresés...
                </div>
              ) : cities.length > 1 ? (
                /* Dropdown if multiple cities found */
                <select
                  className="w-full px-3 py-2 border rounded bg-gray-50"
                  value={formData.varos}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, varos: e.target.value })}
                >
                  <option value="">-- Válassz --</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.nev}>
                      {c.nev}
                    </option>
                  ))}
                </select>
              ) : (
                /* Normal input if 0 or 1 city found (allow manual override if 0) */
                <input
                  className="w-full px-3 py-2 border rounded bg-gray-50"
                  placeholder="Város"
                  value={formData.varos}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, varos: e.target.value })}
                  /* ReadOnly if we auto-filled it from a single result to prevent typos */
                  readOnly={cities.length === 1}
                  style={cities.length === 1 ? { backgroundColor: '#e8f0fe' } : {}}
                />
              )}
            </div>
          </div>

          <input
            className="w-full px-3 py-2 border rounded bg-gray-50"
            placeholder="Utca, házszám"
            value={formData.utca}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, utca: e.target.value })}
          />
          {/* --------------------- */}

          <br />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 text-white rounded font-semibold transition-colors ${loading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {loading ? "Regisztráció..." : "Regisztráció"}
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-gray-600">
          Van már fiókod?{" "}
          <span
            className="text-blue-500 cursor-pointer hover:underline"
            onClick={() => navigate("/login")}
          >
            Jelentkezz be!
          </span>
        </p>
      </div>
    </div>
  );
}