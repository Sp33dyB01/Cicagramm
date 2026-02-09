import { useState } from 'react';

export default function UserManager() {
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Data State
  const [userData, setUserData] = useState<any>(null);
  
  // --- EDITING STATES ---
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});

  // --- 1. GET FUNCTION (VIEW USER) ---
  const handleFetch = async (idOverride?: string) => {
    const idToFetch = idOverride || currentUserId;
    if (!idToFetch) return;
    
    setLoading(true);
    setUserData(null);
    setIsEditing(false); 
    setMessage(null);

    try {
      // Note: Make sure your route is mounted correctly (e.g., /api/felhasznalo/:id)
      const res = await fetch(`/api/profile/${idToFetch}`);
      const data = await res.json();

      if (res.ok) {
        setUserData(data);
      } else {
        setMessage({ text: data.error || 'Nem található ilyen felhasználó', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Hálózati hiba', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // --- 2. DELETE FUNCTION ---
  const handleDelete = async () => {
    if (!currentUserId || !confirm("Biztosan törölni akarod ezt a felhasználót? MINDEN macskája is törlődni fog!")) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/profile/${currentUserId}`, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok) {
        setMessage({ text: 'Felhasználó és minden adata törölve!', type: 'success' });
        setUserData(null);
        setCurrentUserId('');
      } else {
        setMessage({ text: data.error || 'Törlés sikertelen (Jogosultság?)', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Hálózati hiba', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // --- 3. PREPARE EDIT MODE ---
  const startEditing = () => {
    setEditFormData({
        nev: userData.nev,
        email: userData.email,
        rBemutat: userData.rBemutat || "",
        irsz: userData.irsz || "",
        utca: userData.utca || ""
    });
    setIsEditing(true);
  };

  // --- 4. SUBMIT UPDATES (PATCH) ---
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userData) return;
    setLoading(true);

    const formData = new FormData();

    // Append Text Fields
    formData.append('nev', editFormData.nev);
    formData.append('email', editFormData.email);
    formData.append('rBemutat', editFormData.rBemutat);
    formData.append('irsz', editFormData.irsz);
    formData.append('utca', editFormData.utca);

    // Append Profile Picture (Only if new one selected)
    const pKepInput = (e.currentTarget.elements.namedItem('newPkep') as HTMLInputElement);
    if (pKepInput.files && pKepInput.files[0]) {
        formData.append('pKep', pKepInput.files[0]);
    }

    try {
        const res = await fetch(`/api/profile/${userData.id}`, {
            method: 'PATCH',
            body: formData
        });
        const result = await res.json();

        if (res.ok) {
            setMessage({ text: 'Sikeres módosítás!', type: 'success' });
            setIsEditing(false);
            handleFetch(userData.id); // Refresh data
        } else {
            setMessage({ text: result.error || 'Hiba történt', type: 'error' });
        }
    } catch (err) {
        setMessage({ text: 'Hálózati hiba', type: 'error' });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>👤 Felhasználó Kezelő (Admin)</h1>

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

      {/* --- CONTROLS --- */}
      <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', background: '#f9f9f9' }}>
        <h2>Műveletek</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input 
            type="text" 
            placeholder="Felhasználó ID..." 
            value={currentUserId} 
            onChange={(e) => setCurrentUserId(e.target.value)}
            style={{ flex: 1, padding: '5px' }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => handleFetch()} disabled={!currentUserId || loading} style={{ flex: 1, padding: '10px' }}>
            🔍 Keresés
          </button>
          
          {userData && !isEditing && (
            <button onClick={startEditing} style={{ flex: 1, padding: '10px', background: '#ffc107', border: 'none' }}>
                ✏️ Szerkesztés
            </button>
          )}

          <button onClick={handleDelete} disabled={!currentUserId || loading} style={{ flex: 1, padding: '10px', background: '#dc3545', color: 'white', border: 'none' }}>
            🗑️ Törlés
          </button>
        </div>

        {/* --- DISPLAY / EDIT AREA --- */}
        {userData && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'white', border: '1px solid #ddd' }}>
            
            {/* A. VIEW MODE */}
            {!isEditing ? (
                <>
                    <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                        <img 
                            src={userData.pKep ? `/api/images/${userData.pKep}` : 'https://placehold.co/100'} 
                            alt="Profile" 
                            style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '50%' }} 
                        />
                        <div>
                            <h3>{userData.nev} {userData.admin === 1 && '🛡️(Admin)'}</h3>
                            <p style={{margin: 0, color: '#666'}}>{userData.email}</p>
                            <small>{userData.id}</small>
                        </div>
                    </div>
                    
                    <hr/>
                    <p><strong>Bio:</strong> {userData.rBemutat || "Nincs megadva"}</p>
                    <p><strong>Cím:</strong> {userData.irsz} {userData.utca}</p>

                    <h4>Macskák ({userData.cats ? userData.cats.length : 0}):</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {userData.cats && userData.cats.map((cat: any) => (
                            <div key={cat.cId} style={{border: '1px solid #eee', padding: '5px', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                                <img 
                                    src={`/api/images/${cat.pKep}`} 
                                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }} 
                                />
                                <div>
                                    <strong>{cat.nev}</strong> ({cat.kor} éves)
                                    <br/>
                                    <small>Fajta ID: {cat.fajId}</small>
                                </div>
                            </div>
                        ))}
                        {(!userData.cats || userData.cats.length === 0) && <p>Nincs feltöltött macska.</p>}
                    </div>
                </>
            ) : (
                /* B. EDIT MODE */
                <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h3 style={{color: '#d39e00'}}>Felhasználó Szerkesztése</h3>
                    
                    <label>Név:</label>
                    <input value={editFormData.nev} onChange={(e) => setEditFormData({...editFormData, nev: e.target.value})} />
                    
                    <label>Email:</label>
                    <input type="email" value={editFormData.email} onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} />

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{flex: 1}}>
                            <label>IRSZ:</label>
                            <input type="number" style={{width: '100%'}}
                                value={editFormData.irsz} onChange={(e) => setEditFormData({...editFormData, irsz: e.target.value})} 
                            />
                        </div>
                        <div style={{flex: 2}}>
                            <label>Utca:</label>
                            <input style={{width: '100%'}}
                                value={editFormData.utca} onChange={(e) => setEditFormData({...editFormData, utca: e.target.value})} 
                            />
                        </div>
                    </div>

                    <label>Bio:</label>
                    <textarea value={editFormData.rBemutat} onChange={(e) => setEditFormData({...editFormData, rBemutat: e.target.value})} />

                    <hr />
                    <label><strong>Profilkép cseréje (opcionális):</strong></label>
                    <input name="newPkep" type="file" accept="image/*" />

                    <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                        <button type="submit" style={{ flex: 2, padding: '10px', background: '#28a745', color: 'white', border: 'none' }}>
                            Mentés
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