import { useState, useEffect } from 'react';
import { getCoordinates, getDistance } from '../worker/tavolsag';
// import type { SelectFajta } from '../worker/schema'; // Uncomment if you have the type

export default function CatManager({ currentUser }: { currentUser: any }) {
  const [currentCatId, setCurrentCatId] = useState<string>('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [calculatingDist, setCalculatingDist] = useState(false);
  // Data States
  const [catData, setCatData] = useState<any>(null);
  const [fajtak, setFajtak] = useState<any[]>([]); // Using any[] to avoid import errors
  
  // --- EDITING STATES ---
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]); // IDs of images to remove
  
  // Fetch breeds on load
  useEffect(() => {
    fetch('/api/fajta')
      .then(res => res.json())
      .then(data => setFajtak(data))
      .catch(err => console.error("Hiba a fajták lekérésekor:", err));
  }, []);
  useEffect(() => {
        // If data is missing, stop but TELL US why
    if (!currentUser) {
        return;
    }
    if (!catData) {
        return;
    }

    const calculate = async () => {
        setCalculatingDist(true);
        
        try {
        // A. Get User Location (From DB coords or fallback to Address)
        let userLoc = { lat: currentUser.lat, lon: currentUser.lon };
        
        // If DB doesn't have coords yet, Geocode on the fly (Slow, but works)
        if (!userLoc.lat && currentUser.irsz && currentUser.utca) {
           const coords = await getCoordinates(`${currentUser.irsz} ${currentUser.city || ''} ${currentUser.utca}`);
           if (coords) userLoc = coords;
        }

        // B. Get Cat Owner Location (Assuming catData.owner exists)
        // You might need to update your backend to include: with: { owner: true }
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

        // C. Calculate
        if (userLoc.lat && catLoc) {
            // Need to ensure format matches what getDistance expects (number)
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
  }, [catData, currentUser]);
  // --- 1. UPLOAD FUNCTION (CREATE) ---
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

  // --- 2. GET FUNCTION ---
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

  // --- 3. DELETE FUNCTION ---
  const handleDelete = async () => {
    if (!currentCatId || !confirm("Biztosan törölni akarod ezt a cicát?")) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/cica/${currentCatId}`, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok) {
        setMessage({ text: 'Cica és képek sikeresen törölve!', type: 'success' });
        setCatData(null);
        setCurrentCatId('');
      } else {
        setMessage({ text: data.error || 'Törlés sikertelen', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Hálózati hiba', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // --- 4. PREPARE EDIT MODE ---
  const startEditing = () => {
    setEditFormData({
        nev: catData.nev,
        kor: catData.kor,
        tomeg: catData.tomeg,
        fajId: catData.fajId, // Note: backend sends 'fajId', ensure case matches
        ivartalanitott: catData.ivartalanitott,
        rBemutat: catData.rBemutat || ""
    });
    setIdsToDelete([]); // Clear deletion queue
    setIsEditing(true);
  };

  // --- 5. SUBMIT UPDATES (PATCH) ---
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!catData) return;
    setLoading(true);

    const formData = new FormData();

    // A. Basic Fields
    formData.append('nev', editFormData.nev);
    formData.append('kor', editFormData.kor);
    formData.append('tomeg', editFormData.tomeg);
    formData.append('fajId', editFormData.fajId);
    formData.append('ivartalanitott', editFormData.ivartalanitott);
    formData.append('rBemutat', editFormData.rBemutat);

    // B. Profile Picture (Only if a new file is selected)
    const pKepInput = (e.currentTarget.elements.namedItem('newPkep') as HTMLInputElement);
    if (pKepInput.files && pKepInput.files[0]) {
        formData.append('pKep', pKepInput.files[0]);
    }

    // C. NEW Gallery Images
    const galleryInput = (e.currentTarget.elements.namedItem('newGallery') as HTMLInputElement);
    if (galleryInput.files && galleryInput.files.length > 0) {
        for (let i = 0; i < galleryInput.files.length; i++) {
            formData.append('newImages[]', galleryInput.files[i]);
        }
    }

    // D. Images to DELETE
    idsToDelete.forEach(id => {
        formData.append('deleteImages[]', id);
    });

    try {
        const res = await fetch(`/api/cica/${catData.cId}`, {
            method: 'PATCH',
            body: formData
        });
        const result = await res.json();

        if (res.ok) {
            setMessage({ text: 'Sikeres módosítás!', type: 'success' });
            setIsEditing(false);
            handleFetch(catData.cId); // Refresh data to show changes
        } else {
            setMessage({ text: result.error || 'Hiba történt', type: 'error' });
        }
    } catch (err) {
        setMessage({ text: 'Hálózati hiba', type: 'error' });
    } finally {
        setLoading(false);
    }
  };

  // Helper to toggle image deletion status in Edit Mode
  const toggleDeleteImage = (imgId: string) => {
    if (idsToDelete.includes(imgId)) {
        setIdsToDelete(idsToDelete.filter(id => id !== imgId)); // Un-delete
    } else {
        setIdsToDelete([...idsToDelete, imgId]); // Mark for delete
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>🐱 Cicagramm Admin</h1>

      {/* Message Banner */}
      {message && (
        <div style={{ 
          padding: '1rem', marginBottom: '1rem', borderRadius: '4px',
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24'
        }}>
          {message.text}
        </div>
      )}

      {/* --- SECTION 1: UPLOAD FORM --- */}
      {!isEditing && ( // Hide Create form while editing to reduce clutter
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
            <h2>1. Új Cica Feltöltése</h2>
            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input name="nev" type="text" placeholder="Név (pl. Cirmi)" required />
            <div style={{ display: 'flex', gap: '10px' }}>
                <input name="kor" type="number" placeholder="Kor (év)" required style={{ flex: 1 }} />
                <input name="tomeg" type="number" step="0.1" placeholder="Tömeg (kg)" required style={{ flex: 1 }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
                <select name="fajId" required style={{ flex: 1 }}>
                <option value="">-- Válassz Fajta --</option>
                {fajtak.map((f) => (
                    <option key={f.id} value={f.id}>{f.fajta}</option>
                ))}
                </select>
                <select name="ivartalanitott" required style={{ flex: 1 }}>
                <option value="0">Nem ivartalanított</option>
                <option value="1">Ivartalanított</option>
                </select>
            </div>
            <textarea name="rBemutat" placeholder="Rövid bemutatkozás..." />
            <label>
                <strong>Profilkép (Kötelező):</strong>
                <input name="pKep" type="file" accept="image/*" required />
            </label>
            <label>
                <strong>Galéria:</strong>
                <input name="mKepek[]" type="file" accept="image/*" multiple />
            </label>
            <button type="submit" disabled={loading} style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
                {loading ? 'Mentés...' : 'Cica Mentése'}
            </button>
            </form>
        </div>
      )}

      {/* --- SECTION 2: OPERATIONS --- */}
      <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', background: '#f9f9f9' }}>
        <h2>2. Műveletek</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input 
            type="text" 
            placeholder="Cica ID keresése..." 
            value={currentCatId} 
            onChange={(e) => setCurrentCatId(e.target.value)}
            style={{ flex: 1, padding: '5px' }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => handleFetch()} disabled={!currentCatId || loading} style={{ flex: 1, padding: '10px' }}>
            🔍 Keresés
          </button>
          
          {catData && !isEditing && (
            <button onClick={startEditing} style={{ flex: 1, padding: '10px', background: '#ffc107', border: 'none' }}>
                ✏️ Szerkesztés
            </button>
          )}

          <button onClick={handleDelete} disabled={!currentCatId || loading} style={{ flex: 1, padding: '10px', background: '#dc3545', color: 'white', border: 'none' }}>
            🗑️ Törlés
          </button>
        </div>
{/* --- DISPLAY DATA --- */}
        {catData && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'white', border: '1px solid #ddd' }}>
            
            {!isEditing ? (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <h3>{catData.nev} ({catData.kor} éves)</h3>
                            <p><strong>Fajta:</strong> {catData.species?.fajta || catData.fajId}</p>
                        </div>
                        
                        {/* DISTANCE BADGE */}
                        <div style={{ textAlign: 'right' }}>
                            {calculatingDist ? (
                                <span style={{ fontSize: '0.8rem', color: 'grey' }}>📍 Számítás...</span>
                            ) : distance !== null ? (
                                <div style={{ background: '#e8f0fe', padding: '5px 10px', borderRadius: '15px', color: '#1a73e8', fontWeight: 'bold' }}>
                                    📍 {distance.toFixed(1)} km
                                </div>
                            ) : (
                                <span style={{ fontSize: '0.8rem', color: '#999' }}>📍 Távolság ismeretlen</span>
                            )}
                        </div>
                    </div>

                    <p><strong>Bio:</strong> {catData.rBemutat}</p>
                    
                    {/* Owner Info (Optional) */}
                    {catData.owner && (
                        <p style={{fontSize: '0.9rem', color: '#666'}}>
                            <strong>Gazdi:</strong> {catData.owner.nev} ({catData.owner.city || catData.owner.irsz})
                        </p>
                    )}

                    <h4>Profilkép:</h4>
                    <img src={`/api/images/${catData.pKep}`} alt="Profile" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%' }} />

                    <h4>Galéria:</h4>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {catData.images && catData.images.map((img: any) => (
                           <img key={img.mkepId} src={`/api/images/${img.mkepId}`} style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                        ))}
                    </div>
                </>
            ) : (
                /* B. EDIT MODE */
                <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h3 style={{color: '#d39e00'}}>Szerkesztés: {catData.nev}</h3>
                    
                    <label>Név:</label>
                    <input 
                        value={editFormData.nev} 
                        onChange={(e) => setEditFormData({...editFormData, nev: e.target.value})} 
                    />
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{flex: 1}}>
                            <label>Kor:</label>
                            <input type="number" style={{width: '100%'}}
                                value={editFormData.kor} 
                                onChange={(e) => setEditFormData({...editFormData, kor: e.target.value})} 
                            />
                        </div>
                        <div style={{flex: 1}}>
                            <label>Tömeg:</label>
                            <input type="number" step="0.1" style={{width: '100%'}}
                                value={editFormData.tomeg} 
                                onChange={(e) => setEditFormData({...editFormData, tomeg: e.target.value})} 
                            />
                        </div>
                    </div>

                    <label>Fajta:</label>
                    <select 
                        value={editFormData.fajId || ""} 
                        onChange={(e) => setEditFormData({...editFormData, fajId: e.target.value})}
                    >
                        {fajtak.map((f) => (
                            <option key={f.id} value={f.id}>{f.fajta}</option>
                        ))}
                    </select>

                    <label>Bio:</label>
                    <textarea 
                        value={editFormData.rBemutat} 
                        onChange={(e) => setEditFormData({...editFormData, rBemutat: e.target.value})} 
                    />

                    <hr />

                    {/* Image Editing Section */}
                    <label><strong>Profilkép cseréje (opcionális):</strong></label>
                    <input name="newPkep" type="file" accept="image/*" />

                    <label><strong>Galéria képek kezelése:</strong></label>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', padding: '10px', background: '#eee' }}>
                        {catData.images && catData.images.map((img: any) => {
                            const isMarkedForDelete = idsToDelete.includes(img.mkepId);
                            return (
                                <div key={img.mkepId} style={{ position: 'relative', opacity: isMarkedForDelete ? 0.4 : 1 }}>
                                    <img 
                                        src={`/api/images/${img.mkepId}`} 
                                        style={{ width: '80px', height: '80px', objectFit: 'cover' }} 
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => toggleDeleteImage(img.mkepId)}
                                        style={{
                                            position: 'absolute', top: 0, right: 0, 
                                            background: isMarkedForDelete ? 'grey' : 'red', 
                                            color: 'white', border: 'none', cursor: 'pointer',
                                            width: '20px', height: '20px'
                                        }}
                                    >
                                        {isMarkedForDelete ? '↩' : 'X'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    <label>+ Új képek hozzáadása a galériához:</label>
                    <input name="newGallery" type="file" accept="image/*" multiple />

                    <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                        <button type="submit" style={{ flex: 2, padding: '10px', background: '#28a745', color: 'white', border: 'none' }}>
                            Módosítások Mentése
                        </button>
                        <button type="button" onClick={() => setIsEditing(false)} style={{ flex: 1, padding: '10px' }}>
                            Mégsem
                        </button>
                    </div>
                </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}