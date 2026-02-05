import { useState,useEffect } from 'react';
import type { SelectFajta } from '../worker/schema';
export default function CatManager() {
  // State for the uploaded Cat ID (to easily test View/Delete after upload)
  const [currentCatId, setCurrentCatId] = useState<string>('');
  
  // Feedback state
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [catData, setCatData] = useState<any>(null);
  const [fajtak, setFajtak] = useState<SelectFajta[]>([]);
  useEffect(() => {
  fetch('/api/fajta')
    .then(res => res.json())
    .then(data => setFajtak(data))
    .catch(err => console.error("Hiba a fajták lekérésekor:", err));
}, []);
  // --- 1. UPLOAD FUNCTION ---
  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch('/api/cica', {
        method: 'POST',
        body: formData, // Browser handles boundaries automatically
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ text: `Siker! Új cica ID: ${data.cId}`, type: 'success' });
        setCurrentCatId(data.cId); // Save ID for other tests
        form.reset();
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
  const handleFetch = async () => {
    if (!currentCatId) return;
    setLoading(true);
    setCatData(null);
    setMessage(null);

    try {
      const res = await fetch(`/api/cica/${currentCatId}`);
      const data = await res.json();

      if (res.ok) {
        setCatData(data);
      } else {
        setMessage({ text: data.error || 'Nem található', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Hálózati hiba', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // --- 3. DELETE FUNCTION ---
  const handleDelete = async () => {
    if (!currentCatId || !confirm("Biztosan törölni akarod ezt a cicát?")) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/cica/${currentCatId}`, {
        method: 'DELETE',
      });
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

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>🐱 Cicagramm Admin Teszt</h1>

      {/* Message Banner */}
      {message && (
        <div style={{ 
          padding: '1rem', 
          marginBottom: '1rem', 
          borderRadius: '4px',
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24'
        }}>
          {message.text}
        </div>
      )}

      {/* --- SECTION 1: UPLOAD FORM --- */}
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
              <option value="">-- Válassz Fajta ID-t --</option>
              {fajtak.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.fajta}
              </option>
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
            <strong>Galéria (Több kép is lehet):</strong>
            {/* Note the name="mKepek[]" and the 'multiple' attribute */}
            <input name="mKepek[]" type="file" accept="image/*" multiple />
          </label>

          <button type="submit" disabled={loading} style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
            {loading ? 'Mentés...' : 'Cica Mentése'}
          </button>
        </form>
      </div>

      {/* --- SECTION 2: TEST CONTROLS --- */}
      <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', background: '#f9f9f9' }}>
        <h2>2. Műveletek</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input 
            type="text" 
            placeholder="Cica ID" 
            value={currentCatId} 
            onChange={(e) => setCurrentCatId(e.target.value)}
            style={{ flex: 1, padding: '5px' }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleFetch} disabled={!currentCatId || loading} style={{ flex: 1, padding: '10px' }}>
            🔍 Adatok Lekérése
          </button>
          <button onClick={handleDelete} disabled={!currentCatId || loading} style={{ flex: 1, padding: '10px', background: '#dc3545', color: 'white', border: 'none' }}>
            🗑️ Törlés
          </button>
        </div>

        {/* --- DISPLAY DATA --- */}
        {catData && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'white', border: '1px solid #ddd' }}>
            <h3>{catData.nev} ({catData.kor} éves)</h3>
            <p><strong>ID:</strong> {catData.cId}</p>
            <p><strong>Bio:</strong> {catData.rBemutat}</p>
            
            <h4>Profilkép:</h4>
            {/* Assuming you have a route to serve images like /api/images/:key */}
            <img 
              src={`/api/images/${catData.pKep}`} 
              alt="Profile" 
              style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%' }} 
            />

            <h4>Galéria ({catData.images.length}):</h4>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {catData.images.map((img: any) => (
                <img 
                  key={img.mkepId}
                  src={`/api/images/${img.mkepId}`} 
                  alt="Gallery" 
                  style={{ width: '80px', height: '80px', objectFit: 'cover' }} 
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
