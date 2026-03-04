import React, { useState, useEffect } from "react";
import avatarImg from "./assets/default_profile_icon.webp";
import { useToast } from "./Toast";
import { Trash2 } from "lucide-react";
import "./MainApp.css";
import type { SelectFelhasznalo, SelectCica } from "../worker/schema";

export default function Admin() {
    const { showToast } = useToast();
    const [users, setUsers] = useState<(SelectFelhasznalo & { cats: SelectCica[] })[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUserId, setSelectedUserId] = useState<string>("all");
    const [activeTab, setActiveTab] = useState<"details" | "posts">("details");

    const [editMode, setEditMode] = useState(false);
    const [editFormData, setEditFormData] = useState<any>({});

    // Cat editing state
    const [editingCatId, setEditingCatId] = useState<string | null>(null);
    const [editCatData, setEditCatData] = useState<any>({});

    const fetchUsers = () => {
        setLoading(true);
        fetch("/api/profile")
            .then((res) => {
                if (!res.ok) throw new Error("Hálózati hiba a felhasználók betöltésekor");
                return res.json();
            })
            .then((data) => {
                console.log("Fetched users:", data);
                setUsers(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                showToast("Nem sikerült betölteni a felhasználókat.", "error");
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const selectedUser = users.find((u) => u.id === selectedUserId);

    // Filter cats for the "Posts" tab
    const catsToDisplay =
        selectedUserId === "all"
            ? users.flatMap((u) => u.cats.map((c: any) => ({ ...c, owner: u })))
            : selectedUser?.cats || [];

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        if (!window.confirm(`Biztosan törölni szeretnéd a következő felhasználót és minden hozzá tartozó adatot: ${selectedUser.nev}?`)) return;

        try {
            const res = await fetch(`/api/profile/${selectedUser.id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.error) {
                showToast(data.error, "error");
            } else {
                showToast("Felhasználó sikeresen törölve.", "success");
                setSelectedUserId("all");
                fetchUsers();
            }
        } catch (err) {
            console.error(err);
            showToast("Hiba történt a törlés során.", "error");
        }
    };

    const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handleSaveUser = async () => {
        if (!selectedUser) return;
        try {
            const formData = new FormData();
            Object.entries(editFormData).forEach(([key, value]) => {
                formData.append(key, value as string);
            });

            const res = await fetch(`/api/profile/${selectedUser.id}`, {
                method: "PATCH",
                body: formData
            });
            const data = await res.json();
            if (data.error) {
                showToast(data.error, "error");
            } else {
                showToast("Adatok sikeresen frissítve!", "success");
                setEditMode(false);
                fetchUsers();
            }
        } catch (err) {
            console.error(err);
            showToast("Hiba az adatok mentésekor.", "error");
        }
    };

    const startEditMode = () => {
        if (!selectedUser) return;
        setEditFormData({
            nev: selectedUser.nev || "",
            email: selectedUser.email || "",
            varos: selectedUser.varos || "",
            utca: selectedUser.utca || "",
            irsz: selectedUser.irsz || "",
            rBemutat: selectedUser.rBemutat || ""
        });
        setEditMode(true);
    };

    const handleDeleteCat = async (cId: string, catName: string) => {
        if (!window.confirm(`Biztosan törölni szeretnéd a következő cicát: ${catName}?`)) return;

        try {
            const res = await fetch(`/api/cica/${cId}`, { method: "DELETE" });
            const data = await res.json();
            if (data.error) {
                showToast(data.error, "error");
            } else {
                showToast("Cica sikeresen törölve.", "success");
                fetchUsers(); // Refresh data
            }
        } catch (err) {
            console.error(err);
            showToast("Hiba történt a törlés során.", "error");
        }
    };

    const startEditCat = (cat: any) => {
        setEditCatData({
            nev: cat.nev || "",
            kor: cat.kor || "",
            tomeg: cat.tomeg || "",
            rBemutat: cat.rBemutat || "",
            fajId: cat.fajId || "",
            ivartalanitott: cat.ivartalanitott ?? 0
        });
        setEditingCatId(cat.cId);
    };

    const handleEditCatChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setEditCatData({ ...editCatData, [e.target.name]: e.target.value });
    };

    const handleSaveCat = async (cId: string) => {
        try {
            const formData = new FormData();
            Object.entries(editCatData).forEach(([key, value]) => {
                formData.append(key, value as string);
            });

            const res = await fetch(`/api/cica/${cId}`, {
                method: "PATCH",
                body: formData
            });
            const data = await res.json();
            if (data.error) {
                showToast(data.error, "error");
            } else {
                showToast("Cica adatai frissítve!", "success");
                setEditingCatId(null);
                fetchUsers();
            }
        } catch (err) {
            console.error(err);
            showToast("Hiba az adatok mentésekor.", "error");
        }
    };

    const handleDeleteImage = async (cId: string, imgId: string) => {
        if (!window.confirm("Biztosan törölni szeretnéd ezt a képet?")) return;

        try {
            const formData = new FormData();
            formData.append('deleteImages[]', imgId);

            const res = await fetch(`/api/cica/${cId}`, {
                method: "PATCH",
                body: formData
            });
            const data = await res.json();
            if (data.error) {
                showToast(data.error, "error");
            } else {
                showToast("Kép sikeresen törölve.", "success");
                fetchUsers();
            }
        } catch (err) {
            console.error(err);
            showToast("Hiba a kép törlésekor.", "error");
        }
    };



    if (loading) return <div className="flex justify-center items-center min-h-[50vh] text-xl font-semibold">Betöltés...</div>;

    return (
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-70px)] bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 transition-colors">
            <aside className="w-full md:w-80 bg-white dark:bg-neutral-800 p-6 border-r border-neutral-200 dark:border-neutral-700 shadow-sm shrink-0">
                <h2 className="text-2xl font-bold mb-6">Admin Vezérlőpult</h2>
                <div className="mb-4">
                    <label htmlFor="userSelect" className="block mb-2 font-medium">Felhasználó választás:</label>
                    <select
                        id="userSelect"
                        value={selectedUserId}
                        onChange={(e) => {
                            setSelectedUserId(e.target.value);
                            setActiveTab("details");
                        }}
                        className="w-full p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                    >
                        <option value="all">Mindenki</option>
                        {users.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.nev} ({u.email})
                            </option>
                        ))}
                    </select>
                </div>
            </aside>

            <main className="flex-1 p-4 md:p-8">
                <div className="flex gap-2 mb-6 border-b-2 border-neutral-200 dark:border-neutral-700">
                    {selectedUserId !== "all" && (
                        <button
                            className={`px-4 py-2 text-base font-medium border-b-2 -mb-[2px] transition-colors focus:outline-none ${activeTab === "details" ? "text-rose-600 border-rose-600 dark:text-rose-500 dark:border-rose-500" : "text-neutral-500 border-transparent hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"}`}
                            onClick={() => setActiveTab("details")}
                        >
                            Felhasználó Részletei
                        </button>
                    )}
                    <button
                        className={`px-4 py-2 text-base font-medium border-b-2 -mb-[2px] transition-colors focus:outline-none ${activeTab === "posts" || selectedUserId === "all" ? "text-rose-600 border-rose-600 dark:text-rose-500 dark:border-rose-500" : "text-neutral-500 border-transparent hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"}`}
                        onClick={() => setActiveTab("posts")}
                    >
                        Posztok (Cicák)
                    </button>
                </div>

                <div className="bg-transparent">
                    {selectedUserId === "all" || activeTab === "posts" ? (
                        <div>
                            <h3 className="text-xl font-semibold mb-4">{selectedUserId === "all" ? "Minden Cica" : `${selectedUser?.nev} cicái`}</h3>
                            {catsToDisplay.length === 0 ? (
                                <p className="text-neutral-500 dark:text-neutral-400 italic">Nincs találat.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {catsToDisplay.map((cat: any) => (
                                        <div key={cat.cId} className="bg-white dark:bg-neutral-800 rounded-xl p-5 border border-neutral-200 dark:border-neutral-700 shadow-sm transition hover:shadow-md">
                                            {editingCatId === cat.cId ? (
                                                <div className="flex flex-col gap-3">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">Név</label>
                                                        <input className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-500" name="nev" value={editCatData.nev} onChange={handleEditCatChange} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">Kötelező kor</label>
                                                        <input className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-500" type="number" name="kor" value={editCatData.kor} onChange={handleEditCatChange} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">Tömeg (kg)</label>
                                                        <input className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-500" type="number" step="0.1" name="tomeg" value={editCatData.tomeg} onChange={handleEditCatChange} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">Ivartalanított</label>
                                                        <select className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-500" name="ivartalanitott" value={editCatData.ivartalanitott} onChange={handleEditCatChange}>
                                                            <option value="1">Igen</option>
                                                            <option value="0">Nem</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">Bemutatkozás</label>
                                                        <textarea className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-500" name="rBemutat" value={editCatData.rBemutat} onChange={handleEditCatChange} rows={3}></textarea>
                                                    </div>
                                                    <div className="flex mt-2 gap-2">
                                                        <button className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-lg font-semibold transition-colors shadow-sm active:scale-[0.98]" onClick={() => handleSaveCat(cat.cId)}>Mentés</button>
                                                        <button className="flex-1 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 py-2 rounded-lg font-semibold transition-colors border border-neutral-300 dark:border-neutral-600" onClick={() => setEditingCatId(null)}>Mégse</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <img fetchPriority="high"
                                                        src={`/api/images/${cat.pKep}`}
                                                        alt={cat.nev}
                                                        className="w-full h-48 object-cover rounded-lg mb-4"
                                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                    />
                                                    <div className="space-y-1 mb-4 text-sm">
                                                        <p><strong className="font-semibold text-neutral-900 dark:text-neutral-100">Név:</strong> {cat.nev}</p>
                                                        <p><strong className="font-semibold text-neutral-900 dark:text-neutral-100">Kor:</strong> {cat.kor} év</p>
                                                        <p><strong className="font-semibold text-neutral-900 dark:text-neutral-100">Testsúly:</strong> {cat.tomeg} kg</p>
                                                        <p><strong className="font-semibold text-neutral-900 dark:text-neutral-100">Ivartalanítva:</strong> {cat.ivartalanitott ? "Igen" : "Nem"}</p>
                                                        {selectedUserId === "all" && cat.owner && (
                                                            <p><strong className="font-semibold text-neutral-900 dark:text-neutral-100">Gazdi:</strong> {cat.owner.nev} <span className="text-neutral-500 dark:text-neutral-400">({cat.owner.email})</span></p>
                                                        )}
                                                    </div>

                                                    {cat.images && cat.images.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mb-4">
                                                            {cat.images.map((img: any) => (
                                                                <div key={img.mkepId} className="relative w-16 h-16 sm:w-20 sm:h-20 group">
                                                                    <img fetchPriority="high"
                                                                        src={`/api/images/${img.mkepId}`}
                                                                        alt="cica kép"
                                                                        className="w-full h-full object-cover rounded-md"
                                                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                                    />
                                                                    <button
                                                                        onClick={() => handleDeleteImage(cat.cId, img.mkepId)}
                                                                        className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        title="Kép törlése"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-neutral-200 dark:border-neutral-700">
                                                        <button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors active:scale-[0.98]" onClick={() => startEditCat(cat)}>Szerkesztés</button>
                                                        <button className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors active:scale-[0.98]" onClick={() => handleDeleteCat(cat.cId, cat.nev)}>Törlés</button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <h3 className="text-xl font-semibold mb-4">Felhasználó Szerkesztése</h3>
                            {selectedUser && (
                                <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700 shadow-sm max-w-2xl">
                                    <div className="mb-6 flex justify-center">
                                        <img fetchPriority="high"
                                            src={`/api/images/${selectedUser.pKep}`}
                                            alt="Profilkép"
                                            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-neutral-200 dark:border-neutral-700 shadow-sm"
                                            onError={(e) => { e.currentTarget.src = avatarImg }}
                                        />
                                    </div>
                                    {editMode ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-medium mb-1">Név</label>
                                                <input className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-500" name="nev" value={editFormData.nev} onChange={handleEditFormChange} />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-medium mb-1">Email</label>
                                                <input className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-500" name="email" value={editFormData.email} onChange={handleEditFormChange} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Irányítószám</label>
                                                <input className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-500" type="number" name="irsz" value={editFormData.irsz} onChange={handleEditFormChange} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Város</label>
                                                <input className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-500" name="varos" value={editFormData.varos} onChange={handleEditFormChange} />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-medium mb-1">Utca / Házszám</label>
                                                <input className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-500" name="utca" value={editFormData.utca} onChange={handleEditFormChange} />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-medium mb-1">Rövid Bemutatkozás</label>
                                                <textarea className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-500" name="rBemutat" value={editFormData.rBemutat} onChange={handleEditFormChange} rows={3}></textarea>
                                            </div>
                                            <div className="sm:col-span-2 flex mt-4 gap-3">
                                                <button className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors shadow-sm active:scale-[0.98]" onClick={handleSaveUser}>Mentés</button>
                                                <button className="bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 px-6 py-2 rounded-lg font-semibold transition-colors border border-neutral-300 dark:border-neutral-600" onClick={() => setEditMode(false)}>Mégse</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 text-base">
                                            <p><strong className="font-semibold text-neutral-900 dark:text-neutral-100">Név:</strong> {selectedUser.nev}</p>
                                            <p><strong className="font-semibold text-neutral-900 dark:text-neutral-100">Email:</strong> {selectedUser.email}</p>
                                            <p><strong className="font-semibold text-neutral-900 dark:text-neutral-100">Cím:</strong> {selectedUser.irsz}, {selectedUser.varos}, {selectedUser.utca}</p>
                                            <p><strong className="font-semibold text-neutral-900 dark:text-neutral-100">Bemutatkozás:</strong> {selectedUser.rBemutat || "Nincs megadva"}</p>
                                            <p><strong className="font-semibold text-neutral-900 dark:text-neutral-100">Regisztráció:</strong> {new Date(selectedUser.createdAt).toLocaleString('hu-HU')}</p>
                                            <p><strong className="font-semibold text-neutral-900 dark:text-neutral-100">Admin:</strong> {selectedUser.admin ? "Igen" : "Nem"}</p>

                                            <div className="flex flex-wrap gap-3 pt-6 border-t border-neutral-200 dark:border-neutral-700 mt-6">
                                                <button className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg font-semibold transition-colors shadow-sm active:scale-[0.98]" onClick={startEditMode}>Adatok Szerkesztése</button>
                                                <button className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-lg font-semibold transition-colors shadow-sm active:scale-[0.98] ml-auto" onClick={handleDeleteUser}>Felhasználó Törlése</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
