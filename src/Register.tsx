import { useState, useEffect } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { authClient } from "./auth-client";
import { getCoordinates } from "../worker/tavolsag";
import { useNavigate } from "react-router-dom";
import retryOperation from "./assets/utils/Retry";
import { useToast } from "./Toast";
import { usePostal } from "./hooks/usePostal";
import { useCities } from "./hooks/useCities";
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
  const [formData, setFormData] = useState<FormData>({
    email: '',
    nev: '',
    jelszo: '',
    rBemutat: '',
    irsz: '',
    utca: '',
    pKep: '',
    varos: '',
  });

  const { cities, loadingCities, setCities } = usePostal(formData.irsz);
  const { postals, loadingPostal, setPostals } = useCities(formData.varos);

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
          <div>
            <input
              className="peer w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-shadow invalid:border-rose-500 focus:invalid:border-rose-500 focus:invalid:ring-rose-500"
              placeholder="E-mail"
              type="email"
              required
              value={formData.email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
            />
            <p className="mt-1 text-xs text-rose-500 hidden peer-invalid:block">Kérjük, adjon meg egy érvényes e-mail címet!</p>
          </div>
          <div>
            <input
              className="peer w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-shadow invalid:border-rose-500 focus:invalid:border-rose-500 focus:invalid:ring-rose-500"
              placeholder="Felhasználónév"
              required
              value={formData.nev}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nev: e.target.value })}
            />
            <p className="mt-1 text-xs text-rose-500 hidden peer-invalid:block">A felhasználónév megadása kötelező!</p>
          </div>

          <div>
            <input
              type="password"
              className="peer w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-shadow invalid:border-rose-500 focus:invalid:border-rose-500 focus:invalid:ring-rose-500"
              placeholder="Jelszó"
              required
              value={formData.jelszo}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, jelszo: e.target.value })}
            />
            <p className="mt-1 text-xs text-rose-500 hidden peer-invalid:block">A jelszó megadása kötelező!</p>
          </div>

          <div className="flex gap-3">
            <div className="w-1/3 relative">
              {loadingPostal ? (
                <div className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 italic">
                  Keresés...
                </div>
              ) : postals.length > 1 ? (
                <div>
                  <select
                    className="peer w-full px-3 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-shadow appearance-none invalid:border-rose-500 focus:invalid:border-rose-500 focus:invalid:ring-rose-500"
                    value={formData.irsz}
                    required
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, irsz: e.target.value })}
                  >
                    <option value="">-- --</option>
                    {postals.map((p) => (
                      <option key={`irsz-${p.id}`} value={p.irsz}>
                        {p.irsz}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-rose-500 hidden peer-invalid:block">Kötelező!</p>
                </div>
              ) : (
                <div>
                  <input
                    type="number"
                    className="peer w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-shadow invalid:border-rose-500 focus:invalid:border-rose-500 focus:invalid:ring-rose-500"
                    placeholder="Irsz"
                    required
                    value={formData.irsz}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      const val = e.target.value;
                      setFormData({ ...formData, irsz: val });
                      if (val.length !== 4) setCities([]);
                    }}
                  />
                  <p className="mt-1 text-xs text-rose-500 hidden peer-invalid:block">Kötelező!</p>
                </div>
              )}
            </div>
            <div className="w-2/3 relative">
              {loadingCities ? (
                <div className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 italic">
                  Keresés...
                </div>
              ) : cities.length > 1 ? (
                /* Dropdown if multiple cities found */
                <div>
                  <select
                    className="peer w-full px-3 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-shadow appearance-none invalid:border-rose-500 focus:invalid:border-rose-500 focus:invalid:ring-rose-500"
                    value={formData.varos}
                    required
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, varos: e.target.value })}
                  >
                    <option value="">-- Válassz --</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.nev}>
                        {c.nev}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-rose-500 hidden peer-invalid:block">A város kiválasztása kötelező!</p>
                </div>
              ) : (
                /* Normal input if 0 or 1 city found (allow manual override if 0) */
                <div>
                  <input
                    className="peer w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-shadow invalid:border-rose-500 focus:invalid:border-rose-500 focus:invalid:ring-rose-500"
                    placeholder="Város"
                    required
                    value={formData.varos}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, varos: e.target.value })}
                  />
                  <p className="mt-1 text-xs text-rose-500 hidden peer-invalid:block">A város megadása kötelező!</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <input
              className="peer w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-shadow invalid:border-rose-500 focus:invalid:border-rose-500 focus:invalid:ring-rose-500"
              placeholder="Utca, házszám"
              required
              value={formData.utca}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, utca: e.target.value })}
            />
            <p className="mt-1 text-xs text-rose-500 hidden peer-invalid:block">Utca, házszám megadása kötelező!</p>
          </div>
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