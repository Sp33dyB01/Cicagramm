//import { useState, useEffect } from "react";
export default function MainApp() {
 /*const [cat, setCat] = useState(null); egy poszt adatainek lekérése
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cica/123test")
      .then((res) => res.json())
      .then((data) => {
        setCat(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Hiba:", err);
        setLoading(false);
      });
  }, []);
  if (loading) return <div>Betöltés...</div>;
  if (!cat) return <div>A cica nem található.</div>;*/
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <h1 className="text-2xl font-semibold">
        Főoldal (WIP)
        {
        /* az összes kép ami ahhoz a macska poszthoz van asszociálva 
        {cat.images.map(img => (
        <img 
          key={img.mkepId} 
          src={`/api/images/${img.mkepId}`} 
          alt="Cica kép" 
          className="w-full rounded-lg"
        />
))}*/}
    


      </h1>
    </div>
  );
}
