import type { SelectFelhasznalo } from '../worker/schema';
import { useState } from 'react';
import { useToast } from './Toast';
import { useFajtak } from "./hooks/useFajtak";
import convertToWebP from "./helper/imageToWebP"

export default function Upload(user: SelectFelhasznalo) {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const fajtak = useFajtak();

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const form = e.currentTarget;
        const rawFormData = new FormData(e.currentTarget);
        const optimizedFormData = new FormData();
        for (const [key, value] of rawFormData.entries()) {
            if (value instanceof File && value.name !== "") {
                try {
                    const webpFile = await convertToWebP(value) as Blob;
                    optimizedFormData.append(key, webpFile);
                } catch (error) {
                    console.error(`Failed to convert ${value.name}:`, error);
                    optimizedFormData.append(key, value);
                }
            }
            else {
                optimizedFormData.append(key, value);
            }
        }
        try {
            const res = await fetch('/api/cica', {
                method: 'POST',
                body: optimizedFormData,
            });
            const data = await res.json();

            if (res.ok) {
                showToast(`Siker! Új cica ID: ${data.cId}`, "success");
                form.reset();
            } else {
                showToast(data.error || 'Hiba történt', "error");
            }
        } catch (err) {
            console.log(err)
            showToast('Hálózati hiba', "error");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 px-4 py-12 transition-colors">
            <div className="w-full max-w-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-center mb-6">Új Cica Feltöltése</h2>

                <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                        <input
                            name="nev"
                            type="text"
                            placeholder="Név (pl. Cirmi)"
                            required
                            className="peer w-full px-3 py-2 border rounded-lg border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors invalid:border-rose-500 focus:invalid:border-rose-500 focus:invalid:ring-rose-500"
                        />
                        <p className="mt-1 text-xs text-rose-500 hidden peer-invalid:block">A cica nevének megadása kötelező!</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <input
                                name="kor"
                                type="number"
                                placeholder="Kor (év)"
                                required
                                max='20'
                                className="peer w-full px-3 py-2 border rounded-lg border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors invalid:border-rose-500 focus:invalid:border-rose-500 focus:invalid:ring-rose-500"
                            />
                            <p className="mt-1 text-xs text-rose-500 hidden peer-invalid:block">Adja meg a kort (max 20 év)!</p>
                        </div>
                        <div className="flex-1">
                            <input
                                name="tomeg"
                                type="number"
                                step="0.1"
                                placeholder="Tömeg (kg)"
                                required
                                max="30"
                                className="peer w-full px-3 py-2 border rounded-lg border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors invalid:border-rose-500 focus:invalid:border-rose-500 focus:invalid:ring-rose-500"
                            />
                            <p className="mt-1 text-xs text-rose-500 hidden peer-invalid:block">Adja meg a tömeget (max 30.0 kg)!</p>
                        </div>
                    </div>
                    <div>
                        <select
                            name="nem"
                            required
                            className="peer w-full px-3 py-2 border rounded-lg border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors invalid:border-rose-500 focus:invalid:border-rose-500 focus:invalid:ring-rose-500"
                        >
                            <option value="0">Hím</option>
                            <option value="1">Nőstény</option>
                        </select>
                        <p className="mt-1 text-xs text-rose-500 hidden peer-invalid:block">Válassza ki a cica nemét!</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <select
                                name="fajId"
                                required
                                className="peer w-full px-3 py-2 border rounded-lg border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors invalid:border-rose-500 focus:invalid:border-rose-500 focus:invalid:ring-rose-500"
                            >
                                <option value="">-- Válassz Fajtát --</option>
                                {fajtak.map((f) => (
                                    <option key={f.id} value={f.id}>{f.fajta}</option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-rose-500 hidden peer-invalid:block">Válasszon egy fajtát!</p>
                        </div>
                        <div className="flex-1">
                            <select
                                name="ivartalanitott"
                                required
                                className="peer w-full px-3 py-2 border rounded-lg border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors invalid:border-rose-500 focus:invalid:border-rose-500 focus:invalid:ring-rose-500"
                            >
                                <option value="0">Nem ivartalanított</option>
                                <option value="1">Ivartalanított</option>
                            </select>
                            <p className="mt-1 text-xs text-rose-500 hidden peer-invalid:block">Kötelező adat!</p>
                        </div>
                    </div>

                    <textarea
                        name="rBemutat"
                        placeholder="Rövid bemutatkozás..."
                        className="w-full px-3 py-2 border rounded-lg border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors min-h-[100px]"
                    />

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Profilkép (Kötelező):
                            <input
                                name="pKep"
                                type="file"
                                accept="image/*"
                                required
                                className="peer mt-1 block w-full text-sm text-neutral-500 dark:text-neutral-400
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-bold
                                    file:bg-rose-50 file:text-rose-700
                                    dark:file:bg-rose-950/30 dark:file:text-rose-400
                                    hover:file:bg-rose-100 dark:hover:file:bg-rose-950/50
                                    cursor-pointer"
                            />
                            <p className="mt-2 text-xs text-rose-500 hidden peer-invalid:block">A cica profilképe kötelező!</p>
                        </label>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Galéria:
                            <input
                                name="mKepek[]"
                                type="file"
                                accept="image/*"
                                multiple
                                className="mt-1 block w-full text-sm text-neutral-500 dark:text-neutral-400
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-bold
                                    file:bg-rose-50 file:text-rose-700
                                    dark:file:bg-rose-950/30 dark:file:text-rose-400
                                    hover:file:bg-rose-100 dark:hover:file:bg-rose-950/50
                                    cursor-pointer"
                            />
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 mt-4 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-[0.98]"
                    >
                        {loading ? 'Mentés...' : 'Cica Mentése'}
                    </button>
                </form>
            </div>
        </div>
    );
}