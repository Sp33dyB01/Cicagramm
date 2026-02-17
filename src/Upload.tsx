import type { SelectFelhasznalo } from '../worker/schema';
import { useState, useEffect } from 'react';
import { getCoordinates, getDistance } from '../worker/tavolsag';

export default function Upload(user: SelectFelhasznalo) {
    const [currentCatId, setCurrentCatId] = useState<string>('');
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [loading, setLoading] = useState(false);
    const [distance, setDistance] = useState<number | null>(null);
    const [calculatingDist, setCalculatingDist] = useState(false);
    const [catData, setCatData] = useState<any>(null);
    const [fajtak, setFajtak] = useState<any[]>([]);
    useEffect(() => {
        fetch('/api/fajta')
            .then(res => res.json())
            .then(data => setFajtak(data))
            .catch(err => console.error("Hiba a fajták lekérésekor:", err));
    }, []);
    useEffect(() => {
        if (!user) {
            console.error("Nincsen bejelentkezve!")
            return;
        }
        if (!catData) {
            console.error("Nincsen kitöltve a form!")
            return;
        }
        const calculate = async () => {
            setCalculatingDist(true);

            try {
                let userLoc = { lat: user.lat, lon: user.lon };
                if (!userLoc.lat && user.irsz && user.utca) {
                    const coords = await getCoordinates(`${user.irsz} ${user.varos || ''} ${user.utca}`);
                    if (coords) userLoc = coords;
                }
                const owner = catData.owner || catData.felhasznalo;
                let catLoc = null;

                if (owner) {
                    if (owner.lat && owner.lon) {
                        catLoc = { lat: owner.lat, lon: owner.lon };
                    } else if (owner.irsz && owner.utca) {
                        const coords = await getCoordinates(`${owner.irsz} ${owner.utca}`);
                        if (coords) catLoc = coords;
                    }
                }

                if (userLoc.lat && catLoc) {
                    const d = getDistance(
                        { lat: Number(userLoc.lat), lon: Number(userLoc.lon), displayName: '' },
                        { lat: Number(catLoc.lat), lon: Number(catLoc.lon), displayName: '' }
                    );
                    setDistance(d);
                }
            } catch (e) {
                console.error("Distance error:", e);
            } finally {
                setCalculatingDist(false);
            }
        };

        calculate();
    }, [catData, user]);
    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        const form = e.currentTarget;
        const formData = new FormData(form);
        try {
            const res = await fetch('/api/cica', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (res.ok) {
                setMessage({ text: `Siker! Új cica ID: ${data.cId}`, type: 'success' });
                setCurrentCatId(data.cId);
                form.reset();
                handleFetch(data.cId); // Auto-load the new cat
            } else {
                setMessage({ text: data.error || 'Hiba történt', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Hálózati hiba', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleFetch = async (idOverride?: string) => {
        const idToFetch = idOverride || currentCatId;
        if (!idToFetch) return;
        setLoading(true);
        setCatData(null);
        setDistance(null); // Reset distance on new fetch
        setMessage(null);
        try {
            const res = await fetch(`/api/cica/${idToFetch}`);
            const data = await res.json();
            if (res.ok) setCatData(data);
            else setMessage({ text: data.error || 'Nem található', type: 'error' });
        } catch (err) { setMessage({ text: 'Hálózati hiba', type: 'error' }); }
        finally { setLoading(false); }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-lg bg-white border rounded-lg p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-center mb-6">Új Cica Feltöltése</h2>

                {message && (
                    <div className={`p-4 mb-4 text-sm rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                        <input
                            name="nev"
                            type="text"
                            placeholder="Név (pl. Cirmi)"
                            required
                            className="w-full px-3 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>


                    <div className="flex gap-4">
                        <input
                            name="kor"
                            type="number"
                            placeholder="Kor (év)"
                            required
                            className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            name="tomeg"
                            type="number"
                            step="0.1"
                            placeholder="Tömeg (kg)"
                            required
                            className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <select
                            name="nem"
                            required
                            className="w-full px-3 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="0">Hím</option>
                            <option value="1">Nőstény</option>
                        </select>
                    </div>
                    <div className="flex gap-4">
                        <select
                            name="fajId"
                            required
                            className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">-- Válassz Fajtát --</option>
                            {fajtak.map((f) => (
                                <option key={f.id} value={f.id}>{f.fajta}</option>
                            ))}
                        </select>
                        <select
                            name="ivartalanitott"
                            required
                            className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="0">Nem ivartalanított</option>
                            <option value="1">Ivartalanított</option>
                        </select>
                    </div>

                    <textarea
                        name="rBemutat"
                        placeholder="Rövid bemutatkozás..."
                        className="w-full px-3 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                    />

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Profilkép (Kötelező):
                            <input
                                name="pKep"
                                type="file"
                                accept="image/*"
                                required
                                className="mt-1 block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100"
                            />
                        </label>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Galéria:
                            <input
                                name="mKepek[]"
                                type="file"
                                accept="image/*"
                                multiple
                                className="mt-1 block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100"
                            />
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Mentés...' : 'Cica Mentése'}
                    </button>
                </form>
            </div>
        </div>
    );
}