import React, { useState } from "react";
import { useToast } from "./Toast";
import { useFajtak } from "./hooks/useFajtak";
import { X } from "lucide-react";

export default function EditCatModal({ cat, onClose, onSave }) {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const fajtak = useFajtak();

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        const form = e.currentTarget;
        const formData = new FormData(form);

        try {
            const res = await fetch(`/api/cica/${cat.cId}`, {
                method: "PATCH",
                body: formData,
            });
            const data = await res.json();
            if (res.ok) {
                showToast("Cica adatai sikeresen frissítve!", "success");
                onSave();
            } else {
                showToast(data.error || "Hiba történt", "error");
            }
        } catch (err) {
            showToast("Hálózati hiba", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <div
                className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                >
                    <X className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-neutral-100">
                    Cica módosítása
                </h2>
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Név</label>
                        <input
                            name="nev"
                            type="text"
                            defaultValue={cat.nev}
                            className="w-full px-3 py-2 border rounded-lg border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-colors"
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Kor</label>
                            <input
                                name="kor"
                                type="number"
                                defaultValue={cat.kor}
                                className="w-full px-3 py-2 border rounded-lg border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-colors"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Tömeg</label>
                            <input
                                name="tomeg"
                                type="number"
                                step="0.1"
                                defaultValue={cat.tomeg}
                                className="w-full px-3 py-2 border rounded-lg border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-colors"
                            />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Fajta</label>
                            <select
                                name="fajId"
                                defaultValue={cat.fajId}
                                className="w-full px-3 py-2 border rounded-lg border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-colors"
                            >
                                {fajtak.map((f) => (
                                    <option key={f.id} value={f.id}>{f.fajta}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Ivartalanított</label>
                            <select
                                name="ivartalanitott"
                                defaultValue={cat.ivartalanitott ? 1 : 0}
                                className="w-full px-3 py-2 border rounded-lg border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-colors"
                            >
                                <option value="0">Nem</option>
                                <option value="1">Igen</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Bemutatkozás</label>
                        <textarea
                            name="rBemutat"
                            defaultValue={cat.rBemutat || ""}
                            className="w-full px-3 py-2 border rounded-lg border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-colors min-h-[100px]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Új Profilkép (Kattints ide, ha cserélnéd)</label>
                        <input
                            name="pKep"
                            type="file"
                            accept="image/*"
                            className="block w-full text-sm text-neutral-500 dark:text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 dark:file:bg-rose-950/30 dark:file:text-rose-400 dark:hover:file:bg-rose-950/50 cursor-pointer"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Új Képek hozzáadása</label>
                        <input
                            name="newImages[]"
                            type="file"
                            accept="image/*"
                            multiple
                            className="block w-full text-sm text-neutral-500 dark:text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 dark:file:bg-rose-950/30 dark:file:text-rose-400 dark:hover:file:bg-rose-950/50 cursor-pointer"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 mt-4 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition-all disabled:opacity-50"
                    >
                        {loading ? "Mentés..." : "Módosítások mentése"}
                    </button>
                </form>
            </div>
        </div>
    );
}
