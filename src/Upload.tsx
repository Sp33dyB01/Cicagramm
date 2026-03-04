import { useState } from 'react';
import { useToast } from './Toast';
import { useFajtak } from "./hooks/useFajtak";
import convertToWebP from "./helper/imageToWebP"

export default function Upload() {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [pKepPreview, setPKepPreview] = useState<string | null>(null);
    const [pKepOptimized, setPKepOptimized] = useState<Blob | null>(null);
    const [mKepekPreviews, setMKepekPreviews] = useState<string[]>([]);
    const [mKepekOptimized, setMKepekOptimized] = useState<Blob[]>([]);
    const fajtak = useFajtak();

    const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const webpFile = await convertToWebP(file);
                if (webpFile === 0) {
                    showToast("Sérült vagy üres fájl (0 byte).", "error");
                    setPKepOptimized(null);
                    if (pKepPreview) URL.revokeObjectURL(pKepPreview);
                    setPKepPreview(null);
                    return;
                }
                setPKepOptimized(webpFile as Blob);
                if (pKepPreview) URL.revokeObjectURL(pKepPreview);
                setPKepPreview(URL.createObjectURL(webpFile as Blob));
            } catch (error) {
                console.error("Failed to process profile image:", error);
            }
        } else {
            setPKepOptimized(null);
            if (pKepPreview) URL.revokeObjectURL(pKepPreview);
            setPKepPreview(null);
        }
    };

    const handleGalleryImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            try {
                const optimizedBlobs = await Promise.all(
                    files.map(async (file) => await convertToWebP(file))
                );
                const validBlobs = optimizedBlobs.filter(b => b !== 0) as Blob[];
                setMKepekOptimized(validBlobs);

                mKepekPreviews.forEach(url => URL.revokeObjectURL(url));

                const newPreviews = validBlobs.map(blob => URL.createObjectURL(blob));
                setMKepekPreviews(newPreviews);
            } catch (error) {
                console.error("Failed to process gallery images:", error);
            }
        } else {
            setMKepekOptimized([]);
            mKepekPreviews.forEach(url => URL.revokeObjectURL(url));
            setMKepekPreviews([]);
        }
    };

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitted(true); // Trigger submitted state
        setLoading(true);
        const form = e.currentTarget;
        const rawFormData = new FormData(e.currentTarget);
        const optimizedFormData = new FormData();

        for (const [key, value] of rawFormData.entries()) {
            // Skip the raw file inputs, we will manually append the optimized ones
            if (key !== "pKep" && key !== "mKepek[]") {
                optimizedFormData.append(key, value);
            }
        }

        if (pKepOptimized) {
            optimizedFormData.append("pKep", pKepOptimized, "profile.webp");
        }

        mKepekOptimized.forEach((blob, index) => {
            optimizedFormData.append("mKepek[]", blob, `gallery_${index}.webp`);
        });

        try {
            const res = await fetch('/api/cica', {
                method: 'POST',
                body: optimizedFormData,
            });
            const data = await res.json();

            if (res.ok) {
                showToast(`Sikeres feltöltés!`, "success");
                setSubmitted(false);
                setPKepPreview(null);
                setPKepOptimized(null);
                setMKepekPreviews([]);
                setMKepekOptimized([]);
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

                {/* Added group and data-submitted */}
                <form onSubmit={handleUpload} data-submitted={submitted} className="group space-y-4">

                    {/* --- TEXT INPUT (Fix applied to the <p> tag) --- */}
                    <div>
                        <input
                            name="nev"
                            type="text"
                            placeholder="Név (pl. Cirmi)"
                            required
                            className="peer w-full px-3 py-2 border rounded-lg border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors invalid:not-placeholder-shown:border-rose-500 group-data-[submitted=true]:invalid:border-rose-500 focus:invalid:not-placeholder-shown:border-rose-500 group-data-[submitted=true]:focus:invalid:border-rose-500 focus:invalid:not-placeholder-shown:ring-rose-500 group-data-[submitted=true]:focus:invalid:ring-rose-500"
                        />
                        {/* Fixed line below */}
                        <p className="mt-1 text-xs text-rose-500 hidden peer-[&:not(:placeholder-shown):invalid]:block group-data-[submitted=true]:peer-invalid:block">
                            A cica nevének megadása kötelező!
                        </p>
                    </div>

                    {/* --- NUMBER INPUTS (Fix applied to the <p> tags) --- */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <input
                                name="kor"
                                type="number"
                                placeholder="Kor (év)"
                                required
                                max='20'
                                className="peer w-full px-3 py-2 border rounded-lg border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors invalid:not-placeholder-shown:border-rose-500 group-data-[submitted=true]:invalid:border-rose-500 focus:invalid:not-placeholder-shown:border-rose-500 group-data-[submitted=true]:focus:invalid:border-rose-500 focus:invalid:not-placeholder-shown:ring-rose-500 group-data-[submitted=true]:focus:invalid:ring-rose-500"
                            />
                            {/* Fixed line below */}
                            <p className="mt-1 text-xs text-rose-500 hidden peer-[&:not(:placeholder-shown):invalid]:block group-data-[submitted=true]:peer-invalid:block">
                                Adja meg a kort (max 20 év)!
                            </p>
                        </div>
                        <div className="flex-1">
                            <input
                                name="tomeg"
                                type="number"
                                step="0.1"
                                placeholder="Tömeg (kg)"
                                required
                                max="30"
                                className="peer w-full px-3 py-2 border rounded-lg border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors invalid:not-placeholder-shown:border-rose-500 group-data-[submitted=true]:invalid:border-rose-500 focus:invalid:not-placeholder-shown:border-rose-500 group-data-[submitted=true]:focus:invalid:border-rose-500 focus:invalid:not-placeholder-shown:ring-rose-500 group-data-[submitted=true]:focus:invalid:ring-rose-500"
                            />
                            {/* Fixed line below */}
                            <p className="mt-1 text-xs text-rose-500 hidden peer-[&:not(:placeholder-shown):invalid]:block group-data-[submitted=true]:peer-invalid:block">
                                Adja meg a tömeget (max 30.0 kg)!
                            </p>
                        </div>
                    </div>

                    {/* --- SELECTS (NO placeholder trick, only group-data) --- */}
                    <div>
                        <select
                            name="nem"
                            required
                            className="peer w-full px-3 py-2 border rounded-lg border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors group-data-[submitted=true]:invalid:border-rose-500 group-data-[submitted=true]:focus:invalid:border-rose-500 group-data-[submitted=true]:focus:invalid:ring-rose-500"
                        >
                            <option value="0">Hím</option>
                            <option value="1">Nőstény</option>
                        </select>
                        <p className="mt-1 text-xs text-rose-500 hidden group-data-[submitted=true]:peer-invalid:block">Válassza ki a cica nemét!</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <select
                                name="fajId"
                                required
                                className="peer w-full px-3 py-2 border rounded-lg border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors group-data-[submitted=true]:invalid:border-rose-500 group-data-[submitted=true]:focus:invalid:border-rose-500 group-data-[submitted=true]:focus:invalid:ring-rose-500"
                            >
                                <option value="">-- Válassz Fajtát --</option>
                                {fajtak.map((f) => (
                                    <option key={f.id} value={f.id}>{f.fajta}</option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-rose-500 hidden group-data-[submitted=true]:peer-invalid:block">Válasszon egy fajtát!</p>
                        </div>
                        <div className="flex-1">
                            <select
                                name="ivartalanitott"
                                required
                                className="peer w-full px-3 py-2 border rounded-lg border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors group-data-[submitted=true]:invalid:border-rose-500 group-data-[submitted=true]:focus:invalid:border-rose-500 group-data-[submitted=true]:focus:invalid:ring-rose-500"
                            >
                                <option value="0">Nem ivartalanított</option>
                                <option value="1">Ivartalanított</option>
                            </select>
                            <p className="mt-1 text-xs text-rose-500 hidden group-data-[submitted=true]:peer-invalid:block">Kötelező adat!</p>
                        </div>
                    </div>

                    <textarea
                        name="rBemutat"
                        placeholder="Rövid bemutatkozás..."
                        className="w-full px-3 py-2 border rounded-lg border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors min-h-[100px]"
                    />

                    {/* --- FILES (NO placeholder trick, only group-data) --- */}
                    <div className="space-y-4">
                        <div className="space-y-2 relative">
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Profilkép (Kötelező):
                                <input
                                    name="pKep"
                                    type="file"
                                    accept="image/*"
                                    required
                                    onChange={handleProfileImageChange}
                                    className="peer mt-1 block w-full text-sm text-neutral-500 dark:text-neutral-400
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-sm file:font-bold
                                        file:bg-rose-50 file:text-rose-700
                                        dark:file:bg-rose-950/30 dark:file:text-rose-400
                                        hover:file:bg-rose-100 dark:hover:file:bg-rose-950/50
                                        cursor-pointer group-data-[submitted=true]:invalid:text-rose-500"
                                />
                                <p className="mt-2 text-xs text-rose-500 hidden group-data-[submitted=true]:peer-invalid:block">A cica profilképe kötelező!</p>
                            </label>

                            {/* Profile Image Preview */}
                            {pKepPreview && (
                                <div className="mt-3 relative w-32 h-32 rounded-xl overflow-hidden border-2 border-neutral-200 dark:border-neutral-700 shadow-sm mx-auto">
                                    <img src={pKepPreview} alt="Profilkép előnézet" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 relative border-t border-neutral-200 dark:border-neutral-700 pt-4">
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Galéria:
                                <input
                                    name="mKepek[]"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleGalleryImagesChange}
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

                            {/* Gallery Images Preview */}
                            {mKepekPreviews.length > 0 && (
                                <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                                    {mKepekPreviews.map((preview, idx) => (
                                        <div key={idx} className="shrink-0 relative w-20 h-20 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 shadow-sm">
                                            <img src={preview} alt={`Galéria kép ${idx + 1}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
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