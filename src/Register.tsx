import { useState, useEffect } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { authClient } from "./auth-client";
import { getCoordinates } from "../worker/tavolsag";
import { useNavigate } from "react-router-dom";
import retryOperation from "./assets/utils/Retry";
import { useToast } from "./Toast";
import type { SelectTelepules } from "../worker/schema";
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
  onSuccess: (user: any) => void;
}

export default function Register({ onSuccess }: RegisterProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const [cities, setCities] = useState<SelectTelepules[]>([]);
  const [loadingCities, setLoadingCities] = useState<boolean>(false);
  const [loadingPostal, setLoadingPostal] = useState<Boolean>(false)
  const [postals, setPostals] = useState<SelectTelepules[]>([]);
  const [debouncedValue, setDebouncedValue] = useState<string>('');
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
    const handler = setTimeout(() => {
      setDebouncedValue(formData.varos);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [formData.varos])

  useEffect(() => {
    if (formData.irsz.length === 4) {
      const fetchCities = async () => {
        setLoadingCities(true);
        try {
          const res = await fetch(`/api/varos/irsz/${formData.irsz}`);
          if (res.ok) {
            const data: SelectTelepules[] = await res.json();
            setCities(data);
            if (data.length === 1) {
              setFormData(prev => prev.varos !== data[0].nev ? { ...prev, varos: data[0].nev } : prev);
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
    } else {
      setCities([]);
    }
  }, [formData.irsz]);

  useEffect(() => {
    if (debouncedValue) {
      const fetchPostal = async () => {
        setLoadingPostal(true)
        try {
          const res = await fetch(`/api/varos/nev/${debouncedValue}`)
          if (res.ok) {
            const data: SelectTelepules[] = await res.json();
            setPostals(data);
            if (data.length === 1) {
              setFormData(prev => prev.irsz !== String(data[0].irsz) ? { ...prev, irsz: String(data[0].irsz) } : prev)
            }
          }
        }
        catch (err) {
          console.error("Failed to fetch postal codes", err)
        } finally {
          setLoadingPostal(false)
        }
      };
      fetchPostal();
    } else {
      setPostals([]);
    }
  }, [debouncedValue])
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.email || !formData.jelszo || !formData.nev || !formData.irsz || !formData.utca || !formData.varos) {
      showToast("Kérlek tölts ki minden mezőt!", "error");
      setLoading(false);
      return;
    }
    try {
      const coords = await getCoordinates(formData.irsz, formData.varos, formData.utca);
      if (coords?.displayName) {
        const { data, error } = await retryOperation(async () =>
          authClient.signUp.email({
            email: formData.email,
            password: formData.jelszo,
            name: formData.nev,
            image: "",
            irsz: Number(formData.irsz),
            varos: formData.varos,
            utca: formData.utca,
            lat: coords.lat,
            lon: coords.lon
          }));

        if (error) {
          showToast(error.message || "Hiba történt a regisztráció során.", "error");

        } else {
          showToast("Sikeres regisztráció!", "success");
          onSuccess(data?.user);
          navigate('/');
        }
      }
      else {
        showToast("Nem található a megadott cím. Kérlek, ellenőrizd az adatokat!", "error")
      }
    } catch (err) {
      showToast("Hiba történt a regisztráció során.", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-70px)] flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 px-4 py-8 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl text-center mb-8 font-[cursive] text-rose-600 dark:text-rose-500 drop-shadow-sm">
          Cicagramm
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-shadow"
            placeholder="E-mail"
            type="email"
            value={formData.email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-shadow"
            placeholder="Felhasználónév"
            value={formData.nev}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nev: e.target.value })}
          />

          <input
            type="password"
            className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-shadow"
            placeholder="Jelszó"
            value={formData.jelszo}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, jelszo: e.target.value })}
          />

          <div className="flex gap-3">
            <div className="w-1/3 relative">
              {loadingPostal ? (
                <div className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 italic">
                  Keresés...
                </div>
              ) : postals.length > 1 ? (
                <select
                  className="w-full px-3 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-shadow appearance-none"
                  value={formData.irsz}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, irsz: e.target.value })}
                >
                  <option value="">-- --</option>
                  {postals.map((p) => (
                    <option key={`irsz-${p.id}`} value={p.irsz}>
                      {p.irsz}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-shadow"
                  placeholder="Irsz"
                  value={formData.irsz}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, irsz: e.target.value })}
                />
              )}
            </div>
            <div className="w-2/3 relative">
              {loadingCities ? (
                <div className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 italic">
                  Keresés...
                </div>
              ) : cities.length > 1 ? (
                /* Dropdown if multiple cities found */
                <select
                  className="w-full px-3 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-shadow appearance-none"
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
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-shadow"
                  placeholder="Város"
                  value={formData.varos}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, varos: e.target.value })}
                />
              )}
            </div>
          </div>

          <input
            className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-shadow"
            placeholder="Utca, házszám"
            value={formData.utca}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, utca: e.target.value })}
          />
          {/* --------------------- */}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-white rounded-xl font-bold transition-all shadow-md active:scale-[0.98] ${loading ? 'bg-rose-400 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700 hover:shadow-lg'}`}
            >
              {loading ? "Regisztráció..." : "Regisztráció"}
            </button>
          </div>
        </form>

        <p className="text-sm text-center mt-6 text-neutral-600 dark:text-neutral-400">
          Van már fiókod?{" "}
          <span
            className="text-rose-600 dark:text-rose-500 font-semibold cursor-pointer hover:text-rose-700 dark:hover:text-rose-400 transition-colors"
            onClick={() => navigate("/login")}
          >
            Jelentkezz be!
          </span>
        </p>
      </div>
    </div>
  );
}